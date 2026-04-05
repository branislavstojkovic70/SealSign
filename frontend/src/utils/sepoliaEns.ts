import { ethers } from "ethers";

export function getSepoliaRpcUrl(): string | null {
	const u = (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined)?.trim();
	return u && u.length > 0 ? u : null;
}

let _provider: ethers.providers.StaticJsonRpcProvider | null | undefined;

function getProvider(): ethers.providers.StaticJsonRpcProvider | null {
	const url = getSepoliaRpcUrl();
	if (!url) return null;
	// StaticJsonRpcProvider: no block polling, no network auto-detection — safe alongside AppKit
	if (!_provider) {
		_provider = new ethers.providers.StaticJsonRpcProvider(url, {
			name: "sepolia",
			chainId: 11155111,
			ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
		});
	}
	return _provider;
}

/** Accepts `0x…` (40 hex) or an ENS name; returns checksummed address or null. */
export async function resolveEvmOrEns(input: string): Promise<string | null> {
	const t = input.trim();
	if (!t) return null;
	if (ethers.utils.isAddress(t)) return ethers.utils.getAddress(t);
	return resolveSepoliaEns(t);
}

/** Forward resolution: e.g. name.eth → checksummed 0x address. */
export async function resolveSepoliaEns(name: string): Promise<string | null> {
	const trimmed = name.trim();
	if (!trimmed) return null;
	const p = getProvider();
	if (!p) return null;
	try {
		const addr = await p.resolveName(trimmed);
		return addr ? ethers.utils.getAddress(addr) : null;
	} catch {
		return null;
	}
}

/** Reverse lookup: primary name for address on Sepolia, if set. */
export async function lookupSepoliaPrimary(address: string): Promise<string | null> {
	const raw = address.trim();
	if (!raw || !ethers.utils.isAddress(raw)) return null;
	const p = getProvider();
	if (!p) return null;
	try {
		const name = await p.lookupAddress(ethers.utils.getAddress(raw));
		return name || null;
	} catch {
		return null;
	}
}
