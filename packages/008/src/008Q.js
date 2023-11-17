import * as whisper from "whisper-webgpu";
import { blobToDataURL } from "./utils";
import toWav from 'audiobuffer-to-wav';


async function convertBlobToWav(blob) {
  console.log('skdjskdjs')
  // Leer el blob como un array buffer
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = new Uint8Array(arrayBuffer);

  // Crear el header para el formato WAV
  const buffer = new ArrayBuffer(44 + audioBuffer.length * 2);
  const view = new DataView(buffer);

  // Escribe el header RIFF
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + audioBuffer.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Sub-chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, 44100, true); // Sample rate
  view.setUint32(28, 44100 * 2, true); // Byte rate
  view.setUint16(32, 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  writeString(view, 36, 'data');
  view.setUint32(40, audioBuffer.length * 2, true);

  // Escribe los datos de audio
  floatTo16BitPCM(view, 44, audioBuffer);

  console.log('fuck you');
  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}


const CACHE = {};
export const infer = async ({
  chunks, 
  url, 
  bin = 'medium-q8g16.bin',
  data = 'tokenizer.json' }) => {

  console.log(chunks)
  const fetchBytes = async (url) => {
    if (!CACHE[url]) {
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      CACHE[url] = bytes
      console.log(`loaded ${url}`)
    }

    return CACHE[url];
  }

  const tokenizer = await fetchBytes(data);
  const model = await fetchBytes(bin);
  
  // const audio = await fetchBytes(url);

  await whisper.default();
  const builder = new whisper.SessionBuilder();
  const session = await builder
    .setModel(model)
    .setTokenizer(tokenizer)
    .build();

  

  // const arrayBuffer = await chunks[0].arrayBuffer();
  // const audioUint8Array = new Uint8Array(arrayBuffer);
  // console.log(chunks[0], audioUint8Array)


  const audioContext = new AudioContext();
  let arrayBuffer = await chunks[0].arrayBuffer(); // Suponiendo que chunks[0] es tu Blob de audio
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const wavBlob = new Blob([toWav(audioBuffer)], { type: 'audio/wav' });

   arrayBuffer = await wavBlob.arrayBuffer();
  const audioUint8Array = new Uint8Array(arrayBuffer);

  const { segments } = await session.run(audioUint8Array);
  /*
  const segments = [];
  await session.stream(audioUint8Array, false, (segment) => {
    console.log(segment);
    segments.push(segments);
  });
  */

  console.log(segments)

  session.free();

  return segments
}

export const tts = async ({ audio }) => {
  /*
  const xx = await convertBlobToWav(audio.local[0]);
  const url = URL.createObjectURL(xx);
  const elem = new Audio(url);
  elem.play();

  // const url = await blobToDataURL(new Blob(audio.local));
  console.log(url)
  // const elem = new Audio(url);
  //elem.play();
  */

  /*
  const audioContext = new AudioContext();
const arrayBuffer = await audio.local[0].arrayBuffer(); // Suponiendo que chunks[0] es tu Blob de audio
const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
const wavBlob = new Blob([toWav(audioBuffer)], { type: 'audio/wav' });

const xx = wavBlob;
  const url = URL.createObjectURL(xx);
  const elem = new Audio(url);
  elem.play();
  */

  const remote = (await infer({ chunks: audio.remote })).map(item => ({ ...item, channel: 'remote' }));;
  const local = (await infer({ chunks: audio.local })).map(item => ({ ...item, channel: 'local' }));
  const merged = [...remote, ...local].sort((a, b) => a.start - b.start);
  return merged;
};

