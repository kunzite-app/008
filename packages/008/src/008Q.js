import * as whisper from 'whisper-webgpu';
import toWav from 'audiobuffer-to-wav';
import fixWebmDuration from 'fix-webm-duration';
import { blobToDataURL } from './utils';

const CACHE = {};
const S3Q = 'http://localhost:19006'; //'https://kunziteq.s3.gra.perf.cloud.ovh.net';

export const wavBytes = async ({ chunks }) => {
  // TODO: flatten 2 channels
  let arrayBuffer = await chunks[0].arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const wavBlob = new Blob([toWav(audioBuffer)], { type: 'audio/wav' });

  arrayBuffer = await wavBlob.arrayBuffer();

  return new Uint8Array(arrayBuffer);
};

export const webmBytes = async ({ chunks, duration }) => {
  console.log(duration);
  let xx = new Blob(chunks, { type: 'audio/webm' });
  // console.log(await blobToDataURL(xx))

  xx = await fixWebmDuration(xx, duration, { logger: false });
  // console.log(await blobToDataURL(xx))

  const buffer = await xx.arrayBuffer();
  // console.log(buffer)

  return new Uint8Array(buffer);
};

export const ttsInfer = async ({
  chunks,
  url,
  onStream,
  audio = [],
  bin = `${S3Q}/base.bin`,
  data = `${S3Q}/tts.json`
}) => {
  console.log('ttsInfer');
  const fetchBytes = async url => {
    if (!CACHE[url]) {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      return bytes;
      CACHE[url] = bytes;
    }

    return CACHE[url];
  };

  const tokenizer = await fetchBytes(data);
  const model = await fetchBytes(bin);

  if (url) audio = await fetchBytes(url);
  if (chunks) audio = await wavBytes({ chunks });

  console.log('whisper');
  await whisper.default();
  console.log('building');
  const builder = new whisper.SessionBuilder();
  console.log('session', model, tokenizer);
  const session = await builder.setModel(model).setTokenizer(tokenizer).build();

  let segments = [];

  /*
  if (onStream) {
    await session.stream(audio, false, (segment) => {
      onStream?.(segment);
      segments.push(segments);
    });
  } else {
    try {
      console.log('KJSKDJKSJDSKJDSKJDSKJDKSJDKSJ');
    ({ segments } = await session.run(audio).catch(err => { throw err }))
    } catch (er) {
      console.log('SDNSJKDHKSDJJSDKSJD');
    }
  }
  */

  await session.free();

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
