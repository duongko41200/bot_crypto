const { Api, TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');


// Setting configuration values
const apiId = 26027688;
const apiHash = '05aca4d27393ccd46b1f8ba171c914da';
const phone = '+84866018196';
const username = 'duongko113';
const entity = 'https://t.me/DSNewPairs'; // nhóm Telegram bạn muốn scrape

const BOT_TOKEN = '6911545198:AAGrx2HjuQxvw2TJsVR4MFjgNr_qZhxb_fA';

async function main() {
	const session = new StringSession('');
	const client = new TelegramClient(session, apiId, apiHash, {
		connectionRetries: 5,
	});

	await client.connect();

	console.log('Client Connected');

	// Ensure you're authorized
	// const authorized = await client.authorize();
	// if (!authorized) {
	//     await client.sendCodeRequest(phone);
	//     const code = prompt('Enter the code: ');
	//     await client.signIn(phone, code);
	// }

	// const bots=await client.start({
	// 	botAuthToken: BOT_TOKEN,
	// });

	// console.log("con bot:", bots)

	await client.start({
		phoneNumber:phone,
		password: async () => await input.text('password?'),
		phoneCode: async () => await input.text('Code ?'),
		onError: (err) => console.log(err),
	});
	client.session.save()

	const me = await client.getMe();
	console.log('Authorized as:', me.username);



	setInterval(async() => {
		const history = await client.invoke(new Api.messages.GetHistory({
			peer: "DSNewPairs",
			// offsetId: 43,
			// offsetDate: 43,
			// addOffset: 0,
			limit: 1,
			maxId: 0,
			minId: 0,
			hash: BigInt("-4156887774564")
		}));
	
		console.log("history là:", history.messages)
	}, 2000); 



	/**
	 *  (note: làm giá trị clear cho setInterval)
	 * 1: lấy 2 token mới nhất
	 * 2: so sánh 2 2 token cữ nếu giống nhau thì không thay thế token cũ , khác nhau thì thay thế vào gửi cho người dùng
	 * 3: check điều kiện
	 */	
	 
	// console.log("history là:",history.messages)

	// Lấy lịch sử tin nhắn của nhóm
	const messages = [];
	const limit = 100;
	let offsetId = 0;
	let totalMessages = 0;

}

main().catch(console.error);
