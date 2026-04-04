export async function sha256HexFromFile(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	const bytes = new Uint8Array(hashBuffer);
	let hex = "";
	for (let i = 0; i < bytes.length; i++) {
		hex += bytes[i]!.toString(16).padStart(2, "0");
	}
	return hex;
}
