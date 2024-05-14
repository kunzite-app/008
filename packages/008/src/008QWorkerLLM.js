import PQueue from 'p-queue';

import { summarize } from '008Q';

const QUEUE = new PQueue({ concurrency: 1 });

self.addEventListener('message', async ({ data }) => {
  const { id, transcription } = data;
  console.log(`[008Q] Queuing job ${id}`);

  QUEUE.add(async () => {
    console.log('[008Q] Summarizing...');
    try {
      const summarization = await summarize({ transcription });
      self.postMessage({ id, summarization });
    } catch (err) {
      console.error('[008Q] Error summarizing', err);
      self.postMessage({ id, error: err.message });
    }
  });
});
