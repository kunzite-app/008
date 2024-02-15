import PQueue from 'p-queue';

import { tts } from '008Q';

const QUEUE = new PQueue({ concurrency: 2 });

self.addEventListener('message', async ({ data }) => {
  console.log(`[008Q] Queuing job ${data.id}`);
  const { id, audio } = data;
  QUEUE.add(async () => {
    console.log('[008Q] Transcribing...');
    const transcript = await tts({ audio });

    self.postMessage({ id, ...transcript });
  });
});
