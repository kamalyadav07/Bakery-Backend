const fetch = require('node-fetch');

// @desc    Generate a product description using AI
// @route   POST /api/ai/generate-description
// @access  Private/Admin
exports.generateDescription = async (req, res) => {
    const { keywords } = req.body;

    if (!keywords) {
        return res.status(400).json({ msg: 'Keywords are required to generate a description.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Check if the API key is missing or is still the placeholder value
    if (!apiKey || apiKey === 'YOUR_GOOGLE_AI_API_KEY_HERE') {
        return res.status(500).json({ msg: 'AI API Key is not configured on the server. Please add it to the .env file.' });
    }
    
    // UPDATED MODEL NAME: Changed from gemini-pro to a current model
    const modelName = 'gemini-1.5-flash-latest';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const prompt = `Generate a captivating, short e-commerce product description for a bakery item. The description should be around 2-3 sentences. The tone should be warm, inviting, and delicious. Use the following keywords: "${keywords}".`;

    try {
        const apiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const responseData = await apiResponse.json();

        // Check for errors returned by the Google AI API itself
        if (responseData.error) {
            console.error('Google AI API Error:', responseData.error);
            return res.status(500).json({ msg: `AI Service Error: ${responseData.error.message}` });
        }

        // Check if the expected data structure is present
        if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content) {
             console.error('Unexpected AI API response structure:', responseData);
             return res.status(500).json({ msg: 'Received an unexpected response from the AI service.' });
        }
        
        const generatedText = responseData.candidates[0].content.parts[0].text;
        res.json({ description: generatedText.trim() });

    } catch (err) {
        console.error('Failed to fetch from AI API:', err.message);
        res.status(500).json({ msg: 'Server error while trying to contact the AI service.' });
    }
};
