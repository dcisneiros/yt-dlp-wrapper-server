const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/download-audio', (req, res) => {
  const { url } = req.body;
  const apiKey = req.headers['x-api-key'];
  if (!url || apiKey !== process.env.API_KEY) {
    return res.status(403).send({ error: 'Forbidden or missing URL' });
  }

  const cmd = `yt-dlp -x --audio-format mp3 -o - "${url}"`;
  const proc = exec(cmd, { encoding: 'binary', maxBuffer: Infinity });

  res.setHeader('Content-Type', 'audio/mpeg');
  proc.stdout.pipe(res);
  proc.stderr.on('data', (data) => console.error(data.toString()));
});

app.listen(3000, () => console.log('yt-dlp wrapper server running on port 3000'));
