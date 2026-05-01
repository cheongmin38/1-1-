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

  // API Routes for Gemini proxy
  app.post('/api/gemini/generate', async (req, res) => {
    console.log('API Request: /api/gemini/generate', req.body.model);
    const { model, contents, config } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('Error: GEMINI_API_KEY is missing');
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server. Please add it to your project secrets in the Settings menu.' });
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();
    console.log(`API Key status: Present, Length: ${apiKey.length}, Model: ${model || 'gemini-1.5-flash'}`);

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelInstance = genAI.getGenerativeModel({
        model: model || 'gemini-1.5-flash',
        systemInstruction: config?.systemInstruction,
      });
      
      const response = await modelInstance.generateContent({
        contents,
        generationConfig: config?.generationConfig || config
      });

      res.json({ text: response.response.text() });
    } catch (error: any) {
      console.error('Gemini API Error (Generate):', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  app.post('/api/gemini/stream', async (req, res) => {
    console.log('API Request: /api/gemini/stream', req.body.model);
    const { model, contents, config } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('Error: GEMINI_API_KEY is missing');
      return res.status(500).json({ error: 'GEMINI_API_KEY is not set on the server. Please add it to your project secrets in the Settings menu.' });
    }

    const apiKey = process.env.GEMINI_API_KEY.trim();
    console.log(`API Key status (Stream): Present, Length: ${apiKey.length}, Model: ${model || 'gemini-1.5-flash'}`);

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelInstance = genAI.getGenerativeModel({
        model: model || 'gemini-1.5-flash',
        systemInstruction: config?.systemInstruction,
      });

      const result = await modelInstance.generateContentStream({
        contents,
        generationConfig: config?.generationConfig || config
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText !== undefined) {
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Gemini API Error (Stream):', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  });

  // API Routes (Health check)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
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
