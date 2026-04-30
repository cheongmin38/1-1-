import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/gemini/stream', async (req, res) => {
    const { model, contents, config } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server' });
    }

    try {
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
      const generativeModel = genAI.getGenerativeModel({ 
        model: model || 'gemini-1.5-flash',
        systemInstruction: config?.systemInstruction
      });

      const result = await generativeModel.generateContentStream({
        contents,
        generationConfig: config?.generationConfig
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/gemini/generate', async (req, res) => {
    const { model, contents, config } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server' });
    }

    try {
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
      const generativeModel = genAI.getGenerativeModel({ 
        model: model || 'gemini-1.5-flash',
        systemInstruction: config?.systemInstruction
      });

      const result = await generativeModel.generateContent({
        contents,
        generationConfig: config?.generationConfig
      });

      const response = await result.response;
      res.json({ text: response.text() });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message });
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
