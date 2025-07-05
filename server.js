const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.API_KEY;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

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

  yt.on('close', async code => {
    if (code !== 0) {
      console.error(`yt-dlp exited with code ${code}`);
      return res.status(500).send('Error downloading video');
    }

    const fileStream = fs.createReadStream(filepath);
    const { data, error } = await supabase
      .storage
      .from('audios')
      .upload(filename, fileStream, { contentType: 'audio/mpeg' });

    fs.unlinkSync(filepath);

    if (error) {
      console.error(error);
      return res.status(500).send('Error uploading to storage');
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('audios')
      .getPublicUrl(filename);

    return res.json({ success: true, audio_url: publicUrlData.publicUrl });
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
