import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Extract path from query since Vercel might handle dynamic routes differently if not configured in vercel.json
    // But we can also use the URL structure. Let's assume the user calls /api/neis?path=... or we use vercel.json
    
    const { path: neisPath, ...restQuery } = req.query;

    if (!neisPath || typeof neisPath !== 'string') {
      return res.status(400).json({ error: 'Missing NEIS path parameter' });
    }

    const searchParams = new URLSearchParams(restQuery as any);
    
    // Use API Key from environment if available
    if (process.env.NEIS_API_KEY) {
      searchParams.append('KEY', process.env.NEIS_API_KEY);
    }

    const url = `https://open.neis.go.kr/hub/${neisPath}?${searchParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    return res.status(200).json(data);
  } catch (error) {
    console.error('NEIS Vercel Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch from NEIS' });
  }
}
