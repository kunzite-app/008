import { request } from './utils';
import { SessionManager, AvailableModels } from 'whisper-turbo/dist';

const infer = async ({ chunks, session }) => {
  if (!session) {
    const manager = new SessionManager();
    const loadResult = await manager.loadModel(
        AvailableModels.WHISPER_BASE,
        () => { console.log("loaded!") },
        (progress) => { console.log("Loading: ", progress) }
    );
    if (loadResult.isErr) {
        console.log("Failed to load!");
    }

    session = loadResult.value
  }

  /*
  const blob = new Blob(chunks, { type: 'audio/ogg' });
  const buffer = await blob.arrayBuffer();
  const audioData = new Uint8Array(buffer);
  */

  const url = 'carrental.ogg';
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const audioData = new Uint8Array(buffer);

  console.log(audioData);

  let start = performance.now();
  const segments = [];
  const transcription = await session.transcribe(audioData, (segment) => {
  segments.push(segment);
  if (segment.last) console.log('Transcription complete');
  });

  console.log(`${ performance.now()-start } ms.`);
  // console.log(transcription);
  // console.log(segments)

  return segments
}

export const tts = async ({ audio }) => {
  const remote = await infer({ chunks: audio.remote });
  const local = await infer({ chunks: audio.local });

  return [...remote, local];
};

export const tts2 = async ({ audio: body}) => {
  const port = 13003;
  const endpoint = `http://localhost:${port}/transcribe`;
  const transcript = await request({ endpoint, body });

  console.log(transcript)
  return transcript;
};

