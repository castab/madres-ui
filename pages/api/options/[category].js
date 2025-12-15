export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { category } = req.query;
    
    const backendRes = await fetch(`${process.env.BACKEND_URL}/options/${category}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${process.env.BACKEND_TOKEN}`,
      },
    });
    
    if (!backendRes.ok) {
      throw new Error(`Backend returned ${backendRes.status}`);
    }
    
    // Forward cache headers
    const cacheControl = backendRes.headers.get('cache-control');
    console.log('Cache-Control value:', cacheControl);
    
    if (cacheControl) {
      res.setHeader('Cache-Control', cacheControl);
    }
    
    const data = await backendRes.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch options' });
  }
}