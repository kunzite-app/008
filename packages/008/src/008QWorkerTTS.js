import PQueue from 'p-queue';

import { transcript, tts } from '008Q';

const QUEUE = new PQueue({ concurrency: 5 });

self.addEventListener('message', async ({ data }) => {
  console.log(`[008Q] Queuing job ${data.id}`);
  const { id, audio, wav } = data;
  QUEUE.add(async () => {
    console.log('[008Q] Transcribing...');

    const transcription = await (audio ? tts({ audio }) : transcript({ wav }));

    self.postMessage({ id, transcription });
  });
});
