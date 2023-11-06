import { request } from './utils';

export const tts = async ({ audio: body }) => {
  const port = 13003;
  const endpoint = `http://localhost:${port}/transcribe`;
  const transcript = await request({ endpoint, body });

  return transcript;
};
