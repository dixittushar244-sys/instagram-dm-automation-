const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors());

// ============================================
// ROOT ROUTE - FIXES "NOT FOUND"!
// ============================================
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: '🚀 Instagram DM Automation Bot is running!',
        endpoints: {
            webhook: '/webhook (GET for verification, POST for receiving DMs)',
            sendDm: '/send-dm (POST for sending manual DMs)',
            health: '/health (GET for health check)'
        },
        timestamp: new Date().toISOString()
    });
});

// ============================================
// WEBHOOK VERIFICATION
// ============================================
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('✅ Webhook verified!');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// ============================================
// RECEIVE DMs
// ============================================
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;
        if (body.entry && body.entry[0].messaging) {
            for (const event of body.entry[0].messaging) {
                if (event.message && event.message.text) {
                    const senderId = event.sender.id;
                    const receivedMessage = event.message.text;
                    console.log(`📩 Received: "${receivedMessage}"`);
                    const reply = await generateReply(receivedMessage);
                    await sendInstagramDM(senderId, reply);
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.sendStatus(500);
    }
});

// ============================================
// SEND DM FUNCTION
// ============================================
async function sendInstagramDM(recipientId, message) {
    try {
        const url = `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ID}/messages`;
        const response = await axios.post(
            url,
            { recipient: { id: recipientId }, message: { text: message } },
            { params: { access_token: process.env.INSTAGRAM_ACCESS_TOKEN } }
        );
        return response.data;
    } catch (error) {
        console.error('Error sending DM:', error.message);
        throw error;
    }
}

// ============================================
// GENERATE REPLY WITH OPENAI
// ============================================
async function generateReply(userMessage) {
    if (process.env.OPENAI_API_KEY) {
        try {
            console.log('🤖 Using OpenAI...');
            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: 'You are a helpful customer support bot.' },
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 150
                },
                {
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response.data.choices[0].message.content.trim();
        } catch (error) {
            console.error('OpenAI error:', error.message);
            return fallbackReply(userMessage);
        }
    }
    return fallbackReply(userMessage);
}

function fallbackReply(message) {
    const m = message.toLowerCase();
    if (m.includes('hello') || m.includes('hi')) return 'Hello! 👋 How can I help?';
    if (m.includes('price') || m.includes('cost')) return 'Pricing starts at $49/month.';
    if (m.includes('help')) return 'I\'m here to help! What do you need?';
    if (m.includes('thank')) return 'You\'re welcome! 😊';
    return 'Thanks for your message! Our team will get back to you shortly.';
}

// ============================================
// MANUAL DM SEND
// ============================================
app.post('/send-dm', async (req, res) => {
    const { userId, message } = req.body;
    if (!userId || !message) {
        return res.status(400).json({ error: 'userId and message required' });
    }
    try {
        const result = await sendInstagramDM(userId, message);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ ENABLED' : '❌ DISABLED'}`);
});
