import { createAppKit } from "@reown/appkit/react";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { sepolia } from "@reown/appkit/networks";
import { ledgerFeaturedWalletIds } from "./ledger";

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string;

const metadata = {
	name: "SealSign",
	description: "Cryptographic Guardian of Public Trust",
	url: typeof window !== "undefined" ? window.location.origin : "https://sealsign.app",
	icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

createAppKit({
	adapters: [new Ethers5Adapter()],
	metadata,
	networks: [sepolia],
	projectId,
	themeMode: "dark",
	themeVariables: {
		"--w3m-accent": "#10B981",
		"--w3m-color-mix": "#10B981",
		"--w3m-color-mix-strength": 20,
		"--w3m-border-radius-master": "4px",
	},
	features: {
		analytics: false,
	},
	featuredWalletIds: [...ledgerFeaturedWalletIds],
});
