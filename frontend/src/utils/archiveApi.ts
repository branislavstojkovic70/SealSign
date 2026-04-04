import { API_BASE_URL } from "./api";

export type HcsDocumentRecord = {
	hash: string;
	issuer: string;
	type: string;
	recipient: string;
	issuedAt: string;
};

export type HcsTopicMessage = {
	sequenceNumber: number;
	consensusTimestamp: string;
	document: HcsDocumentRecord;
};

export async function fetchHcsMessages(): Promise<HcsTopicMessage[]> {
	const res = await fetch(`${API_BASE_URL}/api/hedera/messages`);
	if (!res.ok) {
		throw new Error(`Failed to fetch archive (${res.status})`);
	}
	const data = (await res.json()) as { count: number; messages: HcsTopicMessage[] };
	return data.messages;
}
