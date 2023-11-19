import * as whisper from 'whisper-webgpu';
import toWav from 'audiobuffer-to-wav';

const CACHE = {};
const S3Q = 'https://kunziteq.s3.gra.perf.cloud.ovh.net';

export const wavBytes = async ({ chunks }) => {
  // TODO: flatten 2 channels
  let arrayBuffer = await chunks[0].arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const wavBlob = new Blob([toWav(audioBuffer)], { type: 'audio/wav' });

  arrayBuffer = await wavBlob.arrayBuffer();

  return new Uint8Array(arrayBuffer);
};

export const ttsInfer = async ({
  chunks,
  url,
  audio = [],
  bin = `${S3Q}/ttsb.bin`,
  data = `${S3Q}/tts.json`
}) => {
  const fetchBytes = async url => {
    if (!CACHE[url]) {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      CACHE[url] = bytes;
      console.log(`loaded ${url}`);
    }

    return CACHE[url];
  };

  const tokenizer = await fetchBytes(data);
  const model = await fetchBytes(bin);

  if (url) audio = await fetchBytes(url);
  if (chunks) audio = await wavBytes({ chunks });

  await whisper.default();
  const builder = new whisper.SessionBuilder();
  const session = await builder.setModel(model).setTokenizer(tokenizer).build();

  const { segments } = await session.run(audio);

  session.free();

  return segments;
};

export const tts = async ({ audio }) => {
  const remote = (await ttsInfer({ audio: audio.remote })).map(item => ({
    ...item,
    channel: 'remote'
  }));
  const local = (await ttsInfer({ audio: audio.local })).map(item => ({
    ...item,
    channel: 'local'
  }));
  const merged = [...remote, ...local].sort((a, b) => a.start - b.start);

  return merged;
};
