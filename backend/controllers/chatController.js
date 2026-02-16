const fetch = require('node-fetch');

// @desc    Chat with GROQ AI
// @route   POST /api/chat
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey || apiKey === 'your_groq_api_key') {
            // Fallback response when no API key is configured
            return res.status(200).json({
                success: true,
                data: {
                    reply: "I'm Heritage Eats assistant! I can help you with our products, orders, and more. Please configure the GROQ API key for full AI responses. / நான் ஹெரிடேஜ் ஈட்ஸ் உதவியாளர்!"
                }
            });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant for Heritage Eats, a Tamil Nadu homemade traditional sweets, snacks, and pickles store. Help customers with product info, orders, and store details. Keep responses concise and friendly. You can respond in both English and Tamil.'
                    },
                    { role: 'user', content: message }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('GROQ API error:', errData);
            throw new Error('AI service temporarily unavailable');
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that request.';

        res.status(200).json({
            success: true,
            data: { reply }
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Chat service is temporarily unavailable. Please try again later.'
        });
    }
};

module.exports = { sendMessage };
