import { API_BASE_URL } from "./api";

export type HcsDocumentRecord = {
	hash: string;
	issuer: string;
	issuerAddress: string;
	type: string;
	recipient: string;
	issuedAt: string;
};

export type HcsTopicMessage = {
	sequenceNumber: number;
	consensusTimestamp: string;
	document: HcsDocumentRecord;
};

export async function fetchHcsMessages(issuerAddress: string): Promise<HcsTopicMessage[]> {
	const url = `${API_BASE_URL}/api/hedera/messages?issuerAddress=${encodeURIComponent(issuerAddress)}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch archive (${res.status})`);
	}
	const data = (await res.json()) as { count: number; messages: HcsTopicMessage[] };
	return data.messages;
}
