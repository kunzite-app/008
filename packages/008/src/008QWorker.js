import { tts } from './008Q';

let BUSY = false;
const QUEUE = [];

const process = async () => {
  console.log('[AI] Processing...');
  if (BUSY || !QUEUE.length) return;

  try {
    BUSY = true;

    console.log('[AI] Transcribing...');

    const [data] = QUEUE;
    const { id, audio } = data;

    console.log(audio);
    const transcript = await tts({ audio });

    console.log(transcript);

    self.postMessage({ id, transcript });
    QUEUE.shift();
  } catch (err) {
    console.log(err);
    QUEUE.shift();
  } finally {
    BUSY = false;
    process();
  }
};

self.addEventListener('message', async ({ data }) => {
  console.log(`[AI] Queuing job ${data.id}`);
  QUEUE.push(data);
  console.log(`[AI] about`);
  process();
});
