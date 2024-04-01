const { contextBridge, ipcRenderer } = require('electron');

const os = require('os');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const PQueue = require('p-queue').default;

const { Q008_PORT = 1008, Q008_QUEUE_CONCURRENCY = 2 } = process.env;

const QUEUE = new PQueue({ concurrency: Q008_QUEUE_CONCURRENCY });

const errorHandler = (err, req, res, next) => {
  const { statusCode = 500, message: error } = err;
  return res.status(statusCode).json({ error }).end();
};

const upload = multer({
  storage: multer.diskStorage({
    limits: { fileSize: 50 * 1024 * 1024 },
    destination: (req, file, cb) => {
      cb(null, os.tmpdir());
    },
    filename: (req, file, cb) => {
      const { fieldname, originalname } = file;
      cb(null, `${req.body.uuid}-${fieldname}${path.extname(originalname)}`);
    }
  })
});

const app = express();
app.use(bodyParser.json());

app.get('/ping', async (req, res) => {
  res.send('pong');
});

app.post('/login', async (req, res, next) => {
  try {
    document.dispatchEvent(new CustomEvent('Q008:login', { detail: req.body }));
    res.send({ acknowledge: true });
  } catch (err) {
    next(err, req, res);
  }
});

app.post('/q008', upload.single('file'), async (req, res, next) => {
  try {
    await QUEUE.add(async () => {
      const path = `file://${req.file.path}`;
      const id = req.body.uuid;
      document.dispatchEvent(
        new CustomEvent('Q008:audio', { detail: { id, path } })
      );

      res.send({ success: true, id });
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
