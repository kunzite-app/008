import PQueue from 'p-queue';

import { transcript } from '008Q';
console.log('HERE');
const QUEUE = new PQueue({ concurrency: 2 });

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

self.addEventListener('message', async ({ data }) => {
  console.log(`[008Q] Queuing job ${data.id}`);
  const { id, audio } = data;
  QUEUE.add(async () => {
    console.log('[008Q] Transcribing...');
    // const transcript = await tts({ audio });
    const transcriptt = await transcript({
      audio: 'http://localhost:8081/playground/carrental.mp3'
    });
    self.postMessage({ id, transcript: transcriptt });
  });
});
