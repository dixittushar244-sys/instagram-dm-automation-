const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'Instagram DM Bot is running!' });
});

app.get('/webhook', (req, res) => {
    res.send('Webhook is working!');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
