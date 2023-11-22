import { tts } from './008Q';

let BUSY = false;
const QUEUE = [];

const process = async () => {
  // TODO: put back busy check once error handling is fixed
  if (/*BUSY ||*/ !QUEUE.length) return;

  try {
    BUSY = true;

    const [data] = QUEUE;
    const { id, audio } = data;

    console.log('[008Q] Transcribing...');
    const transcript = await tts({ audio });

    self.postMessage({ id, transcript });
  } catch (err) {
    console.error(err);
  } finally {
    QUEUE.shift();
    BUSY = false;
    process();
  }
};

self.addEventListener('message', async ({ data }) => {
  console.log(`[008Q] Queuing job ${data.id}`);
  QUEUE.push(data);
  process();
});
