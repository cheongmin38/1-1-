import express from 'express';
import 'dotenv/config';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes (Health check)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // NEIS Proxy to bypass CORS and hide API keys
  app.get('/api/neis/:path', async (req, res) => {
    try {
      const { path: neisPath } = req.params;
      const searchParams = new URLSearchParams(req.query as any);
      
      // Use API Key from environment if available
      if (process.env.NEIS_API_KEY) {
        searchParams.append('KEY', process.env.NEIS_API_KEY);
      }

      const url = `https://open.neis.go.kr/hub/${neisPath}?${searchParams.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('NEIS Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch from NEIS' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
