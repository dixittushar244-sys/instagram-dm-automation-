const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

// Root route
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: '🚀 Instagram DM Automation Bot is running!',
        endpoints: {
            webhook: '/webhook (GET for verification, POST for receiving DMs)',
            sendDm: '/send-dm (POST for sending manual DMs)',
            health: '/ (GET for health check)'
        },
        timestamp: new Date().toISOString()
    });
});

// Webhook route
app.get('/webhook', (req, res) => {
    res.send('Webhook is working!');
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
