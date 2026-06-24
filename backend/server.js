const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// ============================================
// 1. WEBHOOK VERIFICATION (GET Request)
// ============================================
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully!');
        res.status(200).send(challenge);
    } else {
        console.log('❌ Webhook verification failed!');
        res.sendStatus(403);
    }
});

// ============================================
// 2. RECEIVE INCOMING DMs (POST Request)
// ============================================
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        if (body.entry && body.entry[0].messaging) {
            const messagingEvents = body.entry[0].messaging;

            for (const event of messagingEvents) {
                if (event.message && event.message.text) {
                    const senderId = event.sender.id;
                    const receivedMessage = event.message.text;

                    console.log(`📩 Received DM from ${senderId}: "${receivedMessage}"`);

                    let replyMessage = await generateReply(receivedMessage);
                    await sendInstagramDM(senderId, replyMessage);
                    
                    console.log(`✅ Replied to ${senderId}: "${replyMessage}"`);
                }
            }
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.sendStatus(500);
    }
});

// ============================================
// 3. SEND DM FUNCTION
// ============================================
async function sendInstagramDM(recipientId, message) {
    try {
        const url = `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_BUSINESS_ID}/messages`;
        const response = await axios.post(
            url,
            {
                recipient: { id: recipientId },
                message: { text: message }
            },
            {
                params: {
                    access_token: process.env.INSTAGRAM_ACCESS_TOKEN
                }
            }
        );
        console.log('✅ DM sent successfully');
        return response.data;
    } catch (error) {
        console.error('❌ Error sending DM:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        throw error;
    }
}

// ============================================
// 4. GENERATE REPLY
// ============================================
async function generateReply(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return 'Hello! 👋 How can I help you today?';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
        return 'Our pricing starts at $49/month. Would you like more details?';
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assist')) {
        return 'I\'m here to help! What do you need assistance with?';
    } else if (lowerMessage.includes('thank')) {
        return 'You\'re welcome! 😊 Have a great day!';
    } else if (lowerMessage.includes('yes') || lowerMessage.includes('ok') || lowerMessage.includes('sure')) {
        return 'Great! Let me know how I can assist you further.';
    } else if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        return 'Goodbye! Feel free to reach out anytime. 👋';
    } else if (lowerMessage.includes('instagram') || lowerMessage.includes('social media')) {
        return 'We can help you grow your Instagram presence! What would you like to know?';
    } else {
        return 'Thanks for your message! Our team will get back to you shortly.';
    }
}

// ============================================
// 5. MANUAL DM SEND
// ============================================
app.post('/send-dm', async (req, res) => {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
        return res.status(400).json({ error: 'userId and message are required' });
    }

    try {
        const result = await sendInstagramDM(userId, message);
        res.json({ success: true, message: 'DM sent successfully!', result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 6. TEST ROUTE (FIXED)
// ============================================
app.get('/', (req, res) => {
    res.json({
        "status": "online",
        "message": "🚀 Instagram DM Automation Bot is running!",
        "endpoints": {
            "webhook": "/webhook (GET for verification, POST for receiving DMs)",
            "sendDm": "/send-dm (POST for sending manual DMs)",
            "health": "/ (GET for health check)"
        },
        "timestamp": new Date().toISOString()
    });
});

// ============================================
// 7. HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.status(200).json({
        "status": "healthy",
        "uptime": process.uptime(),
        "timestamp": new Date().toISOString()
    });
});

// ============================================
// 8. START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Instagram DM Automation Bot');
    console.log('='.repeat(50));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📝 Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`🔑 Verify Token: ${process.env.VERIFY_TOKEN}`);
    console.log('='.repeat(50));
    console.log('Waiting for incoming messages...');
});