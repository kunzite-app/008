const fs = require('fs');
const path = require('path');

const fetch = require('node-fetch');

const download = async ({ url, destination }) => {
  const response = await fetch(url);

  // Left to remember that we force the download in every startup to be able to update Q
  // if (fs.existsSync(destination)) return;

  const directory = path.dirname(destination);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  if (!response.ok)
    throw new Error(`Error downloading Q: ${response.statusText}`);

  const stream = fs.createWriteStream(destination);

  response.body.pipe(stream);

  return new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
};

exports.download = download;
