import PQueue from 'p-queue';

import { summarize } from '008Q';

const QUEUE = new PQueue({ concurrency: 1 });

self.addEventListener('message', async ({ data }) => {
  console.log(`[008Q] Queuing job ${data.id}`);

  const { id, transcript: transcription } = data;
  QUEUE.add(async () => {
    console.log('[008Q] Summarizing...');
    const summarization = await summarize({ transcription });
    self.postMessage({ id, summarization });
  });
});
