import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist/ with correct MIME types
app.use(express.static(join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.xml')) {
      res.setHeader('Content-Type', 'application/xml');
    }
    if (path.endsWith('.txt')) {
      res.setHeader('Content-Type', 'text/plain');
    }
  }
}));

// SPA fallback - serve index.html for all other routes
app.get('*', (_, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
