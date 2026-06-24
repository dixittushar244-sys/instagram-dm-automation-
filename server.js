const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;

// ✅ Root route (FIXES "Not Found")
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: '🚀 Instagram DM Automation Bot is running!',
        endpoints: {
            webhook: '/webhook',
            sendDm: '/send-dm',
            health: '/health'
        }
    });
});

// Webhook route
app.get('/webhook', (req, res) => {
    res.send('Webhook is working!');
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
