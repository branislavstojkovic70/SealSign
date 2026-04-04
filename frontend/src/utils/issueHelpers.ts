export function isPdfFile(file: File): boolean {
	const name = file.name.toLowerCase();
	return file.type === "application/pdf" || name.endsWith(".pdf");
}

export function randomHederaStyleTxId(): string {
	const account = Math.floor(100000 + Math.random() * 900000);
	const secs = Math.floor(Date.now() / 1000);
	const nanos = String(Math.floor(Math.random() * 1e9)).padStart(9, "0");
	return `0.0.${account}@${secs}.${nanos}`;
}
