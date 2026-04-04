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
 * Issue fee: native token on the connected EVM chain (Sepolia ETH, Hedera test HBAR, etc.).
 * Set `VITE_ISSUE_PAYMENT_RECIPIENT` to enable; omit to skip payment.
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
