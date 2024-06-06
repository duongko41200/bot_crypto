const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');

const bot = new Telegraf('YOUR_BOT_API_KEY');

// Giả sử contractToken đã được định nghĩa ở đâu đó trong mã của bạn
const contractToken = 'YOUR_CONTRACT_TOKEN';
const NOT_EXIST_CONTRACT_TOKEN = 'Contract token does not exist.';

bot.action('CheckPrice', async (ctx) => {
    if (!contractToken) {
        ctx.reply(NOT_EXIST_CONTRACT_TOKEN, {
            parse_mode: 'HTML',
        });
        return;
    }

    const fetchData = await fetch(`https://price.jup.ag/v4/price?ids=${contractToken}`);
    const res = await fetchData.json();

    const price = res.data[contractToken];

    ctx.reply(
        `\n <b>Price:</b> <b> ${price.price} USDC</b>\n\n<b>TOKEN: </b> ${contractToken} \n<b>Coin:</b> ${price.mintSymbol}`,
        {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '️📉 Sell', callback_data: 'sell' },
                        { text: '️📈 Buy', callback_data: 'buy' },
                    ],
                    [
                        {
                            text: '💰 Setting price sell/buy',
                            callback_data: 'settingPrice',
                        },
                    ],
                    [{ text: '🕛 Refresh', callback_data: 'refreshPrice' }],
                ],
            },
        }
    );
});

// Đăng ký các hành động khác tương tự như trên nếu có
bot.action('sell', (ctx) => {
    // Xử lý logic cho nút sell
});

bot.action('buy', (ctx) => {
    // Xử lý logic cho nút buy
});

bot.action('settingPrice', (ctx) => {
    // Xử lý logic cho nút settingPrice
});

bot.action('refreshPrice', async (ctx) => {
    // Gọi lại hàm 'CheckPrice' để làm mới giá
    ctx.deleteMessage(); // Xóa tin nhắn cũ để tránh lộn xộn
    bot.telegram.sendMessage(
        ctx.chat.id,
        '🔄 Refreshing price...',
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔄 Please wait...', callback_data: 'loading' }],
                ],
            },
        }
    );
    await bot.telegram.handleUpdate(ctx.update);
    bot.telegram.emit('callback_query', { ...ctx.callbackQuery, data: 'CheckPrice' });
});

// Bắt đầu bot
bot.launch();
