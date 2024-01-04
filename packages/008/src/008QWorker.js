import PQueue from 'p-queue';

import { transcript } from '008Q';

export const tts = async ({ audio }) => {
  const remote = (await transcript({ wav: audio.remote })).map(item => ({
    ...item,
    channel: 'remote'
  }));
  const local = (await transcript({ wav: audio.local })).map(item => ({
    ...item,
    channel: 'local'
  }));
  const merged = [...remote, ...local].sort((a, b) => a.start - b.start);

  return merged;
};

const QUEUE = new PQueue({ concurrency: 2 });

self.addEventListener('message', async ({ data }) => {
  console.log(`[008Q] Queuing job ${data.id}`);
  QUEUE.add(async () => {
    const { id, audio } = data;

    console.log('[008Q] Transcribing...');
    const transcript = await tts({ audio });

    self.postMessage({ id, transcript });
  });
});
