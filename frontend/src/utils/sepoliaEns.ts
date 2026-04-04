import { ethers } from "ethers";

const DEFAULT_SEPOLIA_RPC = "https://rpc.sepolia.org";

export function getSepoliaRpcUrl(): string {
	const u = (import.meta.env.VITE_SEPOLIA_RPC_URL as string | undefined)?.trim();
	return u && u.length > 0 ? u : DEFAULT_SEPOLIA_RPC;
}

let provider: ethers.providers.JsonRpcProvider | null = null;

function getProvider(): ethers.providers.JsonRpcProvider {
	if (!provider) {
		provider = new ethers.providers.JsonRpcProvider(getSepoliaRpcUrl());
	}
	return provider;
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
	try {
		const addr = await getProvider().resolveName(trimmed);
		return addr ? ethers.utils.getAddress(addr) : null;
	} catch {
		return null;
	}
}

/** Reverse lookup: primary name for address on Sepolia, if set. */
export async function lookupSepoliaPrimary(address: string): Promise<string | null> {
	const raw = address.trim();
	if (!raw || !ethers.utils.isAddress(raw)) return null;
	try {
		const name = await getProvider().lookupAddress(ethers.utils.getAddress(raw));
		return name || null;
	} catch {
		return null;
	}
}
