# yt-dlp-wrapper-server

API REST para converter vídeos do YouTube em MP3, usando `yt-dlp`.  
Inclui autenticação por chave de API (`x-api-key`).

## Uso
- Variável de ambiente: `API_KEY` com o valor da chave.
- POST `/download-audio` com body JSON `{ "url": "<URL>" }` e header `x-api-key`.

Retorna: stream MP3.
