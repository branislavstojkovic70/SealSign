import { API_BASE_URL } from "./api";

export type HcsDocumentRecord = {
	hash: string;
	issuedAt: string;
	documentName?: string;
	type?: string;
	issuer?: string;
	issuerAddress?: string | null;
	recipient?: string;
	recipientAddress?: string | null;
	issuerEns?: string;
	recipientEns?: string;
};

export type HcsTopicMessage = {
	sequenceNumber: number;
	consensusTimestamp: string;
	document: HcsDocumentRecord;
};

export async function fetchHcsMessages(walletAddress: string): Promise<HcsTopicMessage[]> {
	const url = `${API_BASE_URL}/api/hedera/messages?wallet=${encodeURIComponent(walletAddress)}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch archive (${res.status})`);
	}
	const data = (await res.json()) as { count: number; messages: HcsTopicMessage[] };
	return data.messages;
}
