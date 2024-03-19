const { contextBridge, ipcRenderer } = require('electron');

const express = require('express');
const bodyParser = require('body-parser');
const PQueue = require('p-queue').default;

const { Q008_PORT = 1008, Q008_QUEUE_CONCURRENCY = 5 } = process.env;

const QUEUE = new PQueue({ concurrency: Q008_QUEUE_CONCURRENCY });

const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message: error } = err;
  return res.status(statusCode).json({ error }).end();
};

const app = express();
app.use(bodyParser.json());

app.get('/ping', async (req, res) => {
  res.send('pong');
});

app.get('/transcribe', async (req, res, next) => {
  try {
    await QUEUE.add(async () => {
      const { transcript, processAudio } = window.Q008;
      const { audio } = req.query;
      const { wav } = await processAudio({ input: audio });
      const transcription = await transcript({ wav });
      res.send({ success: true, transcription });
    });
  } catch (err) {
    next(err, req, res);
  }
});

app.use(errorHandler);
app.listen(Q008_PORT, () => {
  console.log(`008Q server running on port ${Q008_PORT}`);
});

contextBridge.exposeInMainWorld('electron', { ipcRenderer });
