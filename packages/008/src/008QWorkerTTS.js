import PQueue from 'p-queue';

import { transcript, tts } from '008Q';

const QUEUE = new PQueue({ concurrency: 5 });

self.addEventListener('message', async ({ data }) => {
  const { id, audio, wav } = data;
  console.log(`[008Q] Queuing job ${id}`);

  console.log('[008Q]', audio, wav);
  QUEUE.add(async () => {
    console.log('[008Q] Transcribing...');

    const transcription = await (audio ? tts({ audio }) : transcript({ wav }));

    self.postMessage({ id, transcription });
  });
});
