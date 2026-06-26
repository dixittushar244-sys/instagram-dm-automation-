const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// ROOT ROUTE - FIXES "NOT FOUND"!
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

app.get('/webhook', (req, res) => {
    res.send('Webhook is working!');
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
