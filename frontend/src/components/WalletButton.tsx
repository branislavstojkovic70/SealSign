import { Button } from "@mui/material";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";

export default function WalletButton() {
	const { open } = useAppKit();
	const { address, isConnected } = useAppKitAccount();

	const label = isConnected
		? `${address?.slice(0, 6)}…${address?.slice(-4)}`
		: "Connect Wallet";

	return (
		<Button
			onClick={() => void open()}
			variant="contained"
			sx={{
				backgroundColor: "#10B981",
				color: "#fff",
				textTransform: "none",
				fontWeight: 600,
				"&:hover": { backgroundColor: "#059669" },
			}}
		>
			{label}
		</Button>
	);
}
