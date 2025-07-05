const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

app.use(express.json());

app.post('/download-audio', async (req, res) => {
  const { url } = req.body;
  const reqApiKey = req.header('x-api-key');

  if (!reqApiKey || reqApiKey !== apiKey) {
    return res.status(403).send('Forbidden: Invalid API Key');
  }

  if (!url) {
    return res.status(400).send('Bad Request: URL is required');
  }

  const filename = `audio-${Date.now()}.mp3`;
  const filepath = path.join('/tmp', filename);

  const yt = spawn('yt-dlp', ['-x', '--audio-format', 'mp3', url, '-o', filepath]);

  yt.stderr.on('data', data => console.error(`stderr: ${data}`));

  yt.on('close', code => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
      return res.status(500).send('Error downloading video');
    }

    return res.json({ success: true, audio_file: filepath });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
