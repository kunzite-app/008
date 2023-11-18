let BUSY = false;
const QUEUE = [];

const process = async () => {
  if (BUSY || !QUEUE.length) return;

  try {
    BUSY = true;

    console.log('[AI] Transcribing...');

    const [data] = QUEUE;
    const { id, audio } = data;
    const transcript = {};

    self.postMessage({ id, transcript });
    QUEUE.shift();
    BUSY = false;
  } finally {
    process();
  }
};

self.addEventListener('message', async ({ data }) => {
  console.log(`[AI] Queuing job ${data.id}`);
  QUEUE.push(data);

  process();
});
