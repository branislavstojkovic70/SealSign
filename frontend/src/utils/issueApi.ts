import { API_BASE_URL } from "./api";

export type IssueApiRequest = {
	/** SHA-256 hex of the PDF (computed in the browser; same value anchored on Hedera). */
	hash: string;
	documentName: string;
	issuerAddress: string;
	recipientAddress: string;
	issuerEns?: string;
	recipientEns?: string;
};

export type IssueApiResult = {
	success: true;
	transactionId: string;
	sequenceNumber: number;
	timestamp: string;
	topicId: string;
	explorerUrl: string;
};

export async function postIssue(body: IssueApiRequest): Promise<IssueApiResult> {
	const res = await fetch(`${API_BASE_URL}/api/issue`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const data = (await res.json()) as IssueApiResult & { error?: string };
	if (!res.ok) {
		throw new Error(
			typeof data.error === "string" ? data.error : `Issue failed (${res.status})`,
		);
	}
	return data;
}
