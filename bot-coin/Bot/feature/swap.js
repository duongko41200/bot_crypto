const {
	Connection,
	Keypair,
	VersionedTransaction,
} = require('@solana/web3.js');
const fetch = require('cross-fetch');
const { Wallet } = require('@project-serum/anchor');
const bs58 = require('bs58');

// It is recommended that you use your own RPC endpoint.
// This RPC endpoint is only for demonstration purposes so that this example will run.
const swapToken = async () => {
	const connection = new Connection(
		'https://solana-mainnet.g.alchemy.com/v2/LnBFwtnd6Z8jy3EuLWOglFWyYncFHyZ9', {
			commitment: "confirmed",
			confirmTransactionInitialTimeout: 50000
		}
	);

	console.log({ connection });

	const wallet = new Wallet(
		Keypair.fromSecretKey(
			bs58.decode(
				'39Gif3RRYaZZcKBZ5bZA4wN5pdLNvQwsY1W8WbZkKHYrHEFx9NUEgMDymYMf3J3K5LJvHfefJb658TsermQCDFJS' ||
					''
			)
		)
	);

	// Swapping SOL to USDC with input 0.1 SOL and 0.5% slippage
	const quoteResponse = await (
		await fetch(
			'https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=3CPmrg1CdQfWU3AiXkXgvq1Wus6r6nHg9FMcaSnznjRY&amount=100000000&slippageBps=50'
		)
	).json();
	console.log({ quoteResponse });

	console.log('wallet;', wallet.publicKey.toBase58());

	const { swapTransaction } = await (
		await fetch('https://quote-api.jup.ag/v6/swap', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				// quoteResponse from /quote api
				quoteResponse,
				// user public key to be used for the swap
				userPublicKey: wallet.publicKey.toString(),
				// auto wrap and unwrap SOL. default is true
				// wrapAndUnwrapSol: true,
				// feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
				// feeAccount: "fee_account_public_key"

				dynamicComputeUnitLimit: true,
				prioritizationFeeLamports: 'auto',
				// prioritizationFeeLamports: {
				//   autoMultiplier: 2,
				// },
			}),
		})
	).json();

	// console.log({ swapTransaction });

	// deserialize the transaction
	const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
	var transaction =
		VersionedTransaction.deserialize(swapTransactionBuf);
	console.log('giao dich', transaction);

	// sign the transaction
	transaction.sign([wallet.payer]);

	const signatures = transaction.getSignatures;
	console.log('Signatures:', signatures);
	// Execute the transaction
	const rawTransaction = transaction.serialize();

	// console.log({ rawTransaction });
	console.log("transaction.message.recentBlockhash",transaction.message.recentBlockhash)



	// try {
	// const txid = await connection.sendRawTransaction(rawTransaction, {
	//     skipPreflight: true,
	//     maxRetries: 2,
	//   });

	//   const latestBlockHash = await connection.getLatestBlockhash();
	//   await connection.confirmTransaction({
	//     blockhash: latestBlockHash.blockhash,
	//     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
	//     signature: txid
	//   }, 'confirmed');

	//   console.log(`https://solscan.io/tx/${txid}`);

	// } catch (error) {
	//   console.error('Error signing or sending the transaction:', error);
	// }

	try {
		const txid = await connection.sendRawTransaction(rawTransaction, {
			skipPreflight: true,
			maxRetries: 2,
		});

		console.log({ txid });
		console.log(`https://solscan.io/tx/${txid}`);

		
		const comfirm = await connection.confirmTransaction(txid);

		console.log({ comfirm });
		
	} catch (error) {
		console.log('lỗi ở chỗ này ;', error);
	}
};
swapToken();
