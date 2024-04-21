const { Telegraf } = require('telegraf');
const Redis = require('ioredis');
const redis = new Redis();

const tutorialMessage = `
	ĐÂy là 1 số chức năng mà bạn có thể thực hiện:\n
	=============================== \n
	1. Check giá cion => BẤM NÚT CHECK GIÁ
	2. SWAP TOKEN

`;

const NOT_EXIST_CONTRACT_TOKEN = `Bạn cần <b>copy & pase contract token</b> bạn muốn check giá vào đây, tôi mới xem giá coin được`;

const setupBot = () => {
	const TOKEN = '6911545198:AAGrx2HjuQxvw2TJsVR4MFjgNr_qZhxb_fA';
	const bot = new Telegraf(TOKEN);
	let contractToken = '';
	let oldMessageContent = '';

	bot.start(async(ctx) => {
		// Gửi tin nhắn và thiết lập nút web_app

		await ctx.telegram.invoke('channels.joinChannel', {
            channel: "DSNewPairs",
        });
		ctx.reply(
			`<b>XIN CHÀO ${ctx.from.first_name}! </b>\n ${tutorialMessage}`,
			{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[
							{ text: '️🎯 Check price', callback_data: 'CheckPrice' },
							{ text: '📈 Wallet', callback_data: 'Wallet' },
						],
						[{ text: '🐋 Setting', callback_data: 'Setting' }],
					],
				},
			}
		);
	});

	bot.action('CheckPrice', async (ctx) => {
		if (!contractToken) {
			ctx.reply(NOT_EXIST_CONTRACT_TOKEN, {
				parse_mode: 'HTML',
			});
			return;
		}

		const fetchData = await fetch(
			`https://price.jup.ag/v4/price?ids=${contractToken}`
		);
		const res = await fetchData.json();

		const price = res.data[contractToken];

		ctx.reply(
			`\n <b>price:</b> <b> ${price.price} USDC</b>\n\n<b>TOKEN: </b> ${contractToken} \n<b>coin:</b> ${price.mintSymbol}`,
			{
				parse_mode: 'HTML',
				reply_markup: {
					inline_keyboard: [
						[
							{ text: '️📉 sell', callback_data: 'sell' },
							{ text: '️📈 buy', callback_data: 'buy' },
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

	bot.action('refreshPrice', async (ctx) => {
		if (contractToken) {
			try {
				const fetchData = await fetch(
					`https://price.jup.ag/v4/price?ids=${contractToken}`
				);
				const res = await fetchData.json();

				const price = res.data[contractToken];

				const newMessageContent = `\n <b>price:</b> <b> ${price.price} USDC</b>\n\n<b>TOKEN: </b> ${contractToken} \n<b>coin:</b> ${price.mintSymbol}`;

				if (oldMessageContent !== newMessageContent) {
					// console.log("thay ddoir")
					oldMessageContent = newMessageContent;
					ctx.editMessageText(
						`\n <b>price:</b> <b> ${price?.price} USDC</b>\n\n<b>TOKEN: </b> ${contractToken} \n<b>coin:</b> ${price?.mintSymbol}`,
						{
							parse_mode: 'HTML',
							reply_markup: {
								inline_keyboard: [
									[
										{ text: '️📉 sell', callback_data: 'sell' },
										{ text: '️📈 buy', callback_data: 'buy' },
									],
									[
										{
											text: '💰 Setting price sell/buy',
											callback_data: 'settingPrice',
										},
									],
									[
										{
											text: '🕛 Refresh',
											callback_data: 'refreshPrice',
										},
									],
								],
							},
						}
					);
				}
			} catch (error) {
				console.log({ error });
			}
		}
		if (!contractToken) {
			ctx.reply(NOT_EXIST_CONTRACT_TOKEN, {
				parse_mode: 'HTML',
			});
			return;
		}
	});

	// bot.use(async (ctx, next) => {
	// 	console.log('Received a message:', ctx.message);
	// 	// await redis.set('contractToken', ctx.message.text);
	// 	// const contractTokenRedis = await redis.get('contractToken');
	// 	contractToken = ctx.message.text;

	// 	ctx.reply(
	// 		`\n Contract Address:\n ============================= \n<b> <i>${contractToken}</i> </b> \n ==============================\n Bây giờ, bạn đã thực hiện được chức năng bên dưới rồi`,
	// 		{
	// 			parse_mode: 'HTML',
	// 			reply_markup: {
	// 				inline_keyboard: [
	// 					[
	// 						{ text: '️🎯 Check price', callback_data: 'CheckPrice' },
	// 						{ text: '📈 Wallet', callback_data: 'Wallet' },
	// 					],
	// 					[{ text: '🐋 Setting', callback_data: 'Setting' }],
	// 				],
	// 			},
	// 		}
	// 	);

	// 	return next();
	// });

	bot.action('settingPrice', async (ctx) => {

		console.log({ctx})
		const apiUrl = `https://api.telegram.org/bot${TOKEN}/getUpdates`;
		try {
			const response = await fetch(apiUrl);
			const data = await response.json();
			console.log({data})
			const messages = data.result;

			console.log("messeafge :L" ,messages[0].callback_query )
			


			
			// for (const message of messages) {
			// 	if (message.message.from.username === botName) {
			// 		return message.message.from.id;
			// 	}
			// }
			// return null; // Không tìm thấy bot với tên đã cho
		} catch (error) {
			console.error('Lỗi khi lấy ID của bot:', error);
			return null;
		}
	});

	// bot.hears('hi', (ctx) => {
	// 	ctx.reply(`hi ${ctx.from.first_name}! how are you today?`);
	// });

	// bot.on('text', (ctx, next) => {
	// 	console.log('ctx tẽt:', ctx.update.message.text);
	// 	ctx.reply('tôi đã nhận được feedback của bạn');
	// 	next(ctx);
	// });

	bot.command('test', (ctx) => {
		ctx.telegram.sendMessage(ctx.chat.id, 'duong dep trai');
		console.log('chat id:', ctx.chat.id, ctx.from);
	});

	bot.command('echo', (ctx) => {
		let input = ctx.message.text;
		let inputArr = input.split(' ');
		let message = '';
		if (inputArr.length === 1) {
			message = 'không có nội dung';
		} else {
			inputArr.shift();
			console.log({ inputArr });
			message = inputArr.join(' ');
		}
		ctx.reply(message);
	});

	bot.launch();

	return bot;
};
setupBot();
module.exports = { setupBot };
