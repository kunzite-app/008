import * as whisper from 'whisper-webgpu';
import toWav from 'audiobuffer-to-wav';

const CACHE = {};
export const ttsInfer = async ({
  chunks,
  url,
  bin = 'models/tts.bin',
  data = 'models/tts.json'
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

  // const audio = await fetchBytes(url);

  let arrayBuffer = await chunks[0].arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const wavBlob = new Blob([toWav(audioBuffer)], { type: 'audio/wav' });

  arrayBuffer = await wavBlob.arrayBuffer();
  const audio = new Uint8Array(arrayBuffer);

  await whisper.default();
  const builder = new whisper.SessionBuilder();
  const session = await builder.setModel(model).setTokenizer(tokenizer).build();

  const { segments } = await session.run(audio);

  /*
  const segments = [];
  await session.stream(audioUint8Array, false, (segment) => {
    console.log(segment);
    segments.push(segments);
  });
  */

  session.free();

  return segments;
};

export const tts = async ({ audio }) => {
  const remote = (await ttsInfer({ chunks: audio.remote })).map(item => ({
    ...item,
    channel: 'remote'
  }));
  const local = (await ttsInfer({ chunks: audio.local })).map(item => ({
    ...item,
    channel: 'local'
  }));
  const merged = [...remote, ...local].sort((a, b) => a.start - b.start);

  console.log(merged);
  return merged;
};
