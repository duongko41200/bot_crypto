const express = require('express');
const bodyParser = require('body-parser');
const { setupBot } = require('./Bot/bot');


const app = express();
const port = process.env.PORT || 3000;

// Thiết lập Bot
const bot = setupBot();

// Middleware để xử lý JSON và xử lý Webhook từ Telegram
app.use(bodyParser.json());

// Xử lý Webhook từ Telegram
app.post('/webhook', (req, res) => {
    bot.handleUpdate(req.body, res);
});

// Lắng nghe trên cổng đã chọn
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    // const webhookUrl = 'https://bot-telegram-swart-seven.vercel.app';
    // bot.telegram.setWebhook(`${webhookUrl}/webhook`);
    // console.log(`Webhook has been set up at: ${webhookUrl}/webhook`);
});