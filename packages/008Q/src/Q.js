import * as whisper from "whisper-webgpu";
import toWav from "audiobuffer-to-wav";

import { InferenceSession, Tensor } from "onnxruntime-web/webgpu";
import * as webllm from "@mlc-ai/web-llm";

const S3Q = "./models";

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
  onProgress,
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

  let segments = [];
  if (onProgress) {
    await session.stream(inputs, false, (segment) => {
      onProgress?.(segment);
      segments.push(segments);
    });
  } else {
    ({ segments } = await session.run(inputs));
  }
  console.warn = consolewarn;

  session.free();

  return segments;
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
  model_list: [
    {
      local_id: "3B",
      model_url: "https://huggingface.co/OO8/3B/resolve/main/",
      model_lib_url: "https://huggingface.co/OO8/3B/resolve/main/webgpu.wasm",
    },
    {
      local_id: "7B",
      model_url: "https://huggingface.co/OO8/7B/resolve/main/",
      model_lib_url: "https://huggingface.co/OO8/7B/resolve/main/webgpu.wasm",
      required_features: ["shader-f16"],
    },
  ],
};

let LLM;

export const chat = async ({
  prompt,
  chatOpts,
  model = "7B",
  onInitProgress = (report) => console.log(report),
  onProgress = (step, message) => console.log(step, message),
}) => {
  let chat = LLM;

  if (!chat) {
    chat = new webllm.ChatModule();
    chat.setInitProgressCallback(onInitProgress);
    await chat.reload(model, chatOpts, llmconf);

    LLM = chat;
  } else {
    chat.interruptGenerate();
  }

  const response = await chat.generate(prompt, onProgress);
  chat.resetChat();

  return response;
};

export const summarize = async ({
  transcript,
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

  const prompt = `Summarize the following conversation into a concise abstract paragraph using the same original language. Avoid unnecessary details or tangential points.

${transcript}
  `;
  return await chat({ prompt, chatOpts, model, onInitProgress, onProgress });
};
