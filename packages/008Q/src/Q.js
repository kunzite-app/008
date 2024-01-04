import * as whisper from "whisper-webgpu";
import { InferenceSession, Tensor } from "onnxruntime-web/webgpu";
import toWav from "audiobuffer-to-wav";

const CACHE = {};
const S3Q = "https://kunziteq.s3.gra.perf.cloud.ovh.net";

export const fetchBytes = async ({ url, cache = true }) => {
  if (!CACHE[url]) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    if (cache) CACHE[url] = bytes;
  }

  return CACHE[url];
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
  onStream,
}) => {
  const inputs = new Uint8Array(wav);

  const tokenizer = await fetchBytes({ url: data });
  const model = await fetchBytes({ url: bin });

  const consolewarn = console.warn;
  console.warn = () => {};
  await whisper.default();
  const builder = new whisper.SessionBuilder();
  const session = await builder.setModel(model).setTokenizer(tokenizer).build();

  let segments = [];
  if (onStream) {
    await session.stream(inputs, false, (segment) => {
      onStream?.(segment);
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
