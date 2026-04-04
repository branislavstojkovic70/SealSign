/** Minimal WebHID typings (not yet in TypeScript’s default DOM lib). */

interface HID extends EventTarget {
	getDevices(): Promise<HIDDevice[]>;
	addEventListener(
		type: "connect" | "disconnect",
		listener: (this: HID, ev: HIDConnectionEvent) => void,
	): void;
	removeEventListener(
		type: "connect" | "disconnect",
		listener: (this: HID, ev: HIDConnectionEvent) => void,
	): void;
}

interface HIDConnectionEvent extends Event {
	readonly device: HIDDevice;
}

interface HIDDevice {
	readonly vendorId: number;
	readonly productId: number;
}

interface Navigator {
	readonly hid?: HID;
}
