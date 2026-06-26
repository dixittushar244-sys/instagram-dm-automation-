const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// SIMPLE ROOT ROUTE - THIS MUST WORK!
app.get('/', (req, res) => {
    res.send('✅ Instagram DM Bot is RUNNING! 🚀');
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
    console.log(`✅ Root route: /`);
    console.log(`✅ Webhook: /webhook`);
    console.log(`✅ Health: /health`);
});
