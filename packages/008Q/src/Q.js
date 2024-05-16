import * as whisper from "whisper-webgpu";
import toWav from "audiobuffer-to-wav";

import { InferenceSession, Tensor } from "onnxruntime-web/webgpu";
import * as webllm from "@mlc-ai/web-llm";

const S3Q = "https://kunziteq.s3.gra.perf.cloud.ovh.net";

export const fetchBytes = async ({ url, cache = true, onProgress }) => {
  const cache_ = await caches.open("008Q");
  const response = await cache_.match(url);

  if (cache && response) {
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    request.onload = async () => {
      const buffer = request.response;
      const bytes = new Uint8Array(buffer);

      const response = new Response(bytes);
      await cache_.put(url, response.clone());

      resolve(bytes);
    };

    request.onerror = () => reject(request.statusText);

    request.onprogress = (ev = {}) => {
      const { lengthComputable, loaded, total } = ev;
      if (lengthComputable) {
        onProgress?.({ progress: loaded / total });
      }
    };

    request.send();
  });
};

export const processAudio = async ({ input }) => {
  let buffer;

  if (typeof input === "string") {
    const response = await fetch(input);
    buffer = await response.arrayBuffer();
  } else {
    buffer = await new Blob(input).arrayBuffer();
  }

  const actx = new AudioContext({
    sampleRate: 16000,
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true,
  });

  const resampled = await actx.decodeAudioData(buffer);

  const leftChannel = resampled.getChannelData(0);
  const rightChannel =
    resampled.numberOfChannels > 1 ? resampled.getChannelData(1) : leftChannel;

  const audio = new Float32Array(leftChannel.length);
  for (let i = 0; i < leftChannel.length; i++)
    audio[i] = (leftChannel[i] + rightChannel[i]) / 2;

  const mono = actx.createBuffer(1, audio.length, actx.sampleRate);
  mono.copyToChannel(audio, 0, 0);

  const wav = toWav(mono);

  return { audio, wav };
};

export const transcript = async ({
  wav,
  bin = `${S3Q}/ttsb.bin`,
  data = `${S3Q}/tts.json`,
  onProgress = (segment) => console.log(segment),
  onInitProgress = (report) => console.log(report),
}) => {
  const inputs = new Uint8Array(wav);

  const tokenizer = await fetchBytes({ url: data });
  const model = await fetchBytes({ url: bin, onProgress: onInitProgress });

  const consolewarn = console.warn;
  console.warn = () => {};
  await whisper.default();
  const builder = new whisper.SessionBuilder();
  const session = await builder.setModel(model).setTokenizer(tokenizer).build();

  const segments = [];
  await session.stream(inputs, false, (segment) => {
    onProgress?.(segment);
    segments.push(segment);
  });
  console.warn = consolewarn;

  session.free();

  return segments;
};

export const tts = async ({ audio }) => {
  const ttschannel = async (channel, wav) => {
    if (!wav) return [];

    return (await transcript({ wav })).map((item) => ({ ...item, channel }));
  };
  const remote = await ttschannel("remote", audio.remote);
  const local = await ttschannel("local", audio.local);
  const merged = [...remote, ...local].sort((a, b) => a.start - b.start);

  return merged;
};

export const onnxSession = ({
  model,
  opts = {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  },
}) => {
  return InferenceSession.create(model, opts);
};

export const vad = async ({ audio, size = 1536, session }) => {
  const batchSize = 1;

  if (!session)
    session = await onnxSession({ model: "models/silero_vad.onnx" });

  const zeroed = () =>
    new Tensor("float32", Array(2 * batchSize * 64).fill(0), [
      2,
      batchSize,
      64,
    ]);

  let h = zeroed();
  let c = zeroed();
  const sr = new Tensor("int64", [16000n]);

  const probs = [];

  const totalSamples = Math.ceil(audio.length / size);
  for (let i = 0; i < totalSamples; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, totalSamples - i);

    let batchData = [];
    for (let j = 0; j < currentBatchSize; j++) {
      const start = (i + j) * size;
      const end = Math.min(start + size, audio.length);
      batchData.push(audio.slice(start, end));
    }

    batchData = batchData.map((data) => {
      const combined = new Float32Array(size);
      combined.set(data);
      return combined;
    });

    let flat = [];
    for (const batch of batchData) {
      flat = flat.concat(...batch);
    }

    const flatf = new Float32Array(batchSize * size);
    flatf.set(flat);

    const input = new Tensor("float32", flatf, [batchSize, size]);
    const { hn, cn, output } = await session.run({ input, h, c, sr });
    h = hn;
    c = cn;

    for (const prob of output.data) probs.push(prob);
  }

  return probs.slice(0, totalSamples);
};

const llmconf = {
  useIndexedDBCache: true,
  model_list: [
    {
      model_id: "3B32Q4",
      model_url: "https://huggingface.co/OO8/3B32/resolve/main/Q4/",
      model_lib_url:
        "https://huggingface.co/OO8/3B32/resolve/main/Q4/webllm.wasm",
    },
    {
      model_id: "3B32",
      model_url: "https://huggingface.co/OO8/3B32/resolve/main/",
      model_lib_url: "https://huggingface.co/OO8/3B32/resolve/main/webllm.wasm",
    },
  ],
};

let LLM;
export const chat = async ({
  prompt,
  chatOpts,
  model = "3B32Q4",
  onInitProgress = (report) => console.log(report),
  onProgress = (step, message) => console.log(step, message),
}) => {
  let chat = LLM;

  if (!chat) {
    chat = new webllm.Engine();
    chat.setInitProgressCallback(onInitProgress);
    await chat.reload(model, chatOpts, llmconf);

    LLM = chat;
  }

  const response = await chat.generate(prompt, onProgress);
  chat.resetChat();

  return response;
};

export const summarize = async ({
  transcription,
  chatOpts = {},
  model,
  onInitProgress,
  onProgress,
}) => {
  chatOpts = {
    temperature: 0.2,
    conv_config: {
      system: "You are a helpful assistant named 008.",
    },
    ...chatOpts,
  };

  let txt = "";
  let diarized = false;
  transcription.forEach(({ channel, text }) => {
    diarized = diarized || channel;
    txt += `${channel ? `${channel}: ` : ""}${text}\n`;
  });

  const promptDiarized = diarized
    ? " If possible the conversation will contain who is the speaker as Local, Remote or SpeakerX where X is a number."
    : "";
  const prompt = `Summarize the following conversation into a concise abstract paragraph. Avoid unnecessary details or tangential points.${promptDiarized}

${txt}\n`;

  return await chat({ prompt, chatOpts, model, onInitProgress, onProgress });
};
