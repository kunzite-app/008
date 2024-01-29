import PQueue from 'p-queue';

import { transcript, summarize } from '008Q';

const QUEUETTS = new PQueue({ concurrency: 2 });
const QUEUELLM = new PQueue({ concurrency: 1 });

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

  const { id, audio, transcript: transcription } = data;
  if (audio) {
    QUEUETTS.add(async () => {
      console.log('[008Q] Transcribing...');
      const transcript = await tts({ audio });
      self.postMessage({ id, transcript });
    });
  }

  if (transcription) {
    QUEUELLM.add(async () => {
      console.log('[008Q] Summarizing...');
      const summarization = await summarize({ transcription });
      self.postMessage({ id, summarization });
    });
  }
});
