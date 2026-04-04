/** Ledger USB vendor id (Nano S/X, Stax, Flex, …). */
export const LEDGER_USB_VENDOR_ID = 0x2c97;

function ledgerAmongHidDevices(devices: HIDDevice[]): boolean {
	return devices.some((d) => d.vendorId === LEDGER_USB_VENDOR_ID);
}

/**
 * True if this origin already has WebHID permission for a Ledger USB device.
 * Browsers only expose paired devices via `getDevices()` (no permission ⇒ usually false until user approves HID once).
 */
export async function detectLedgerHidPresent(): Promise<boolean> {
	if (typeof navigator === "undefined" || !navigator.hid) return false;
	try {
		const devices = await navigator.hid.getDevices();
		return ledgerAmongHidDevices(devices);
	} catch {
		return false;
	}
}

/** Re-scan when a HID device is connected or disconnected (Ledger plug/unplug). */
export function subscribeLedgerHidPresence(onChange: (present: boolean) => void): () => void {
	const hid = typeof navigator !== "undefined" ? navigator.hid : undefined;
	if (!hid) {
		onChange(false);
		return () => {};
	}

	const sync = () => {
		void detectLedgerHidPresent().then(onChange);
	};

	void sync();
	hid.addEventListener("connect", sync);
	hid.addEventListener("disconnect", sync);
	return () => {
		hid.removeEventListener("connect", sync);
		hid.removeEventListener("disconnect", sync);
	};
}

/**
 * Ledger Live connects to dapps via WalletConnect; Reown AppKit routes that
 * through the registry wallet id below (see @reown/appkit-utils PresetsUtil).
 */
export const LEDGER_LIVE_WALLET_CONNECT_ID =
	"19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927" as const;

/** Minimal wallet row for AppKit’s ConnectingWalletConnect flow (metadata is filled in by the modal). */
export const ledgerLiveWalletPreset = {
	id: LEDGER_LIVE_WALLET_CONNECT_ID,
	name: "Ledger Live",
	homepage: "https://www.ledger.com",
} as const;

export const ledgerFeaturedWalletIds = [LEDGER_LIVE_WALLET_CONNECT_ID] as const;

type AppKitOpen = (options?: Record<string, unknown>) => Promise<unknown>;

/**
 * Opens AppKit directly on the WalletConnect pairing screen for Ledger Live.
 * Pass `useAppKit().open` (types omit internal modal `data`; we assert here only).
 */
export function openLedgerLiveConnect(
	open: (opts?: object) => Promise<void | { hash: string } | undefined>,
): Promise<void | { hash: string } | undefined> {
	const ledgerConnectOptions = {
		view: "ConnectingWalletConnect",
		namespace: "eip155",
		data: { wallet: { ...ledgerLiveWalletPreset } },
	};
	return (open as AppKitOpen)(ledgerConnectOptions) as Promise<
		void | { hash: string } | undefined
	>;
}
