const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

app.use(express.json());

app.post('/download-audio', (req, res) => {
  const { url } = req.body;
  const reqApiKey = req.header('x-api-key');
  if (!reqApiKey || reqApiKey !== apiKey) {
    return res.status(403).send('Forbidden: Invalid API Key');
  }
  if (!url) {
    return res.status(400).send('Bad Request: URL is required');
  }

  const ytdlp = spawn('yt-dlp', ['-x', '--audio-format', 'mp3', url, '-o', '-']);
  res.setHeader('Content-Type', 'audio/mpeg');
  ytdlp.stdout.pipe(res);
  ytdlp.stderr.on('data', data => console.error(`stderr: ${data}`));
  ytdlp.on('close', code => {
    if (code !== 0) console.error(`yt-dlp process exited with code ${code}`);
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});