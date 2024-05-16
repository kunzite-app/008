import PQueue from 'p-queue';

import { transcript, tts } from '008Q';

const QUEUE = new PQueue({ concurrency: 5 });

self.addEventListener('message', async ({ data }) => {
  const { id, audio, wav } = data;
  console.log(`[008Q] Queuing job ${id}`);

  QUEUE.add(async () => {
    console.log('[008Q] Transcribing...');
    try {
      const transcription = await (audio
        ? tts({ audio })
        : transcript({ wav }));
      self.postMessage({ id, transcription });
    } catch (err) {
      console.error('[008Q] Error transcribing', err);
      self.postMessage({ id, error: err.message });
    }
  });
});
