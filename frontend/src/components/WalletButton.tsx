import { Button } from "@mui/material";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";
import { openLedgerLiveConnect, subscribeLedgerHidPresence } from "../utils/ledger";

export default function WalletButton() {
	const { open } = useAppKit();
	const { address, isConnected } = useAppKitAccount();
	const [ledgerHidPresent, setLedgerHidPresent] = useState(false);

	useEffect(() => subscribeLedgerHidPresence(setLedgerHidPresent), []);

	const label = isConnected
		? `${address?.slice(0, 6)}…${address?.slice(-4)}`
		: "Connect Wallet";

	const handleConnect = () => {
		if (ledgerHidPresent) void openLedgerLiveConnect(open);
		else void open();
	};

	return (
		<Button
			onClick={isConnected ? () => void open() : handleConnect}
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
