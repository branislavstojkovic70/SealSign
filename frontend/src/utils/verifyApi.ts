import { API_BASE_URL } from "./api";

export type VerifyApiOk = {
	verified: true;
	issuer: string | null;
	issuerAddress?: string | null;
	issuerEns?: string | null;
	documentType: string | null;
	recipient: string | null;
	recipientAddress?: string | null;
	recipientEns?: string | null;
	issuedAt: string | null;
	hederaSequence: number | null;
};

export type VerifyApiNotFound = {
	verified: false;
	message: string;
};

export type VerifyApiResponse = VerifyApiOk | VerifyApiNotFound;

export async function postVerify(hash: string): Promise<VerifyApiResponse> {
	const res = await fetch(`${API_BASE_URL}/api/verify`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ hash }),
	});
	const data = (await res.json()) as VerifyApiResponse & { error?: string };
	if (!res.ok) {
		throw new Error(
			typeof data.error === "string" ? data.error : `Verify failed (${res.status})`,
		);
	}
	return data as VerifyApiResponse;
}
