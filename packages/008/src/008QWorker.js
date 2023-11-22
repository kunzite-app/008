import { tts } from './008Q';

let BUSY = false;
const QUEUE = [];

const process = async () => {
  console.log('[008Q] Processing...');
  if (BUSY || !QUEUE.length) {
    console.log('[008Q] Nothing to do', BUSY, QUEUE);
    return;
  }

  try {
    BUSY = true;

    const [data] = QUEUE;
    const { id, audio } = data;

    console.log('[008Q] Transcribing...');
    const transcript = await tts({ audio }).catch(err => {
      throw err;
    });

    self.postMessage({ id, transcript });
  } catch (err) {
    console.error('ERROROROOROROORR', err);
  }
  console.error('FUUUCJCJCJCJJCJC');
  QUEUE.shift();
  BUSY = false;
  process();
};

self.addEventListener('message', async ({ data }) => {
  console.log(`[008Q] Queuing job ${data.id}`);
  QUEUE.push(data);
  process();
});
