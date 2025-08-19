const fetch = require('node-fetch');

// POST /api/ai/generate-description
exports.generateDescription = async (req, res) => {
  try {
    const { keywords } = req.body;
    if (!keywords) return res.status(400).json({ msg: 'Keywords are required' });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ msg: 'GEMINI_API_KEY not configured on server' });

    const modelName = 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const prompt = `Write a short, mouth-watering product description (max 50–60 words) for a bakery e-commerce card. Make it SEO friendly, fun, and include 1–2 keywords from: ${keywords}. Avoid quotes, avoid hashtags.`;

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('Gemini unexpected response:', JSON.stringify(data).slice(0, 500));
      return res.status(500).json({ msg: 'AI service returned unexpected response' });
    }

    return res.json({ description: text.trim() });
  } catch (err) {
    console.error('generateDescription error:', err);
    return res.status(500).json({ msg: 'Server error calling AI service' });
  }
};
