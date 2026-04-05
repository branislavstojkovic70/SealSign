import { ethers } from "ethers";

export type IssuePaymentConfig = {
	recipient: string;
	value: ethers.BigNumber;
	amountDisplay: string;
};

export type IssuePaymentResolution =
	| { mode: "none" }
	| { mode: "pay"; config: IssuePaymentConfig }
	| { mode: "invalid"; message: string };

/**
 * Issue fee: native token on the connected chain (AppKit / Sepolia ETH).
 * Set `VITE_ISSUE_PAYMENT_RECIPIENT` to enable. Amount from `VITE_ISSUE_PAYMENT_AMOUNT_ETH`, default **0.001**.
 */
export function resolveIssuePayment(): IssuePaymentResolution {
	const raw = (import.meta.env.VITE_ISSUE_PAYMENT_RECIPIENT as string | undefined)?.trim();
	if (!raw) return { mode: "none" };

	if (!ethers.utils.isAddress(raw)) {
		return {
			mode: "invalid",
			message:
				"Invalid VITE_ISSUE_PAYMENT_RECIPIENT in environment (not a valid Ethereum address).",
		};
	}

	const recipient = ethers.utils.getAddress(raw);
	const amountStr = (
		import.meta.env.VITE_ISSUE_PAYMENT_AMOUNT_ETH as string | undefined
	)?.trim();

	const amountDisplay = amountStr && amountStr.length > 0 ? amountStr : "0.001";

	try {
		const value = ethers.utils.parseEther(amountDisplay);
		if (value.lte(0)) {
			return {
				mode: "invalid",
				message: "VITE_ISSUE_PAYMENT_AMOUNT_ETH must be greater than zero.",
			};
		}
		return {
			mode: "pay",
			config: { recipient, value, amountDisplay },
		};
	} catch {
		return {
			mode: "invalid",
			message:
				"Invalid VITE_ISSUE_PAYMENT_AMOUNT_ETH (use a decimal number, e.g. 0.001).",
		};
	}
}

export type Eip1193RequestFn = (args: {
	method: string;
	params?: unknown[];
}) => Promise<unknown>;

function getEip1193Request(wallet: unknown): Eip1193RequestFn | null {
	if (!wallet || typeof wallet !== "object") return null;
	const w = wallet as {
		request?: Eip1193RequestFn;
		ethereum?: { request?: Eip1193RequestFn };
	};
	if (typeof w.request === "function") return w.request.bind(wallet) as Eip1193RequestFn;
	if (w.ethereum && typeof w.ethereum.request === "function") {
		return w.ethereum.request.bind(w.ethereum) as Eip1193RequestFn;
	}
	return null;
}

/**
 * Sends fee via `eth_sendTransaction` (Reown / WalletConnect / browser wallet).
 * Waits for one block confirmation so the server can verify the mined transaction.
 * Returns the transaction hash to be passed to the server for on-chain verification.
 */
export async function sendNativeIssueFee(
	walletProvider: unknown,
	config: IssuePaymentConfig,
	fromAddress: string,
): Promise<string> {
	const request = getEip1193Request(walletProvider);
	if (!request) {
		throw new Error("Wallet does not expose an EIP-1193 provider (request).");
	}

	const from = ethers.utils.getAddress(fromAddress);
	const valueHex = ethers.BigNumber.from(config.value).toHexString();

	const chainIdEnv = (import.meta.env.VITE_PAYMENT_CHAIN_ID as string | undefined)?.trim();
	// Sepolia = 11155111 = 0xaa36a7 (default)
	const chainId = chainIdEnv
		? "0x" + parseInt(chainIdEnv, 10).toString(16)
		: "0xaa36a7";

	const txHash = await request({
		method: "eth_sendTransaction",
		params: [
			{
				from,
				to: config.recipient,
				value: valueHex,
				chainId,
			},
		],
	});

	if (typeof txHash !== "string" || !/^0x[0-9a-f]{64}$/i.test(txHash)) {
		throw new Error("Wallet returned an unexpected response for the payment transaction.");
	}

	// Wait for 1 confirmation before returning — Hedera notarization must not fire
	// until the payment tx is mined. VITE_SEPOLIA_RPC_URL is required for payments.
	const rpcUrl = (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined)?.trim();
	if (!rpcUrl) {
		throw new Error(
			"VITE_SEPOLIA_RPC_URL is not set — cannot confirm payment transaction.",
		);
	}
	const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
	await provider.waitForTransaction(txHash, 1, 120_000);

	return txHash;
}
