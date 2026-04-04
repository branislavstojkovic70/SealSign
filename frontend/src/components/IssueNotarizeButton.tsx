import { Button, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

type IssueNotarizeButtonProps = {
	walletConnected: boolean;
	disabled: boolean;
	onClick: () => void;
	/** When set and wallet is connected, used instead of the default notarize label. */
	connectedLabel?: string;
};

export default function IssueNotarizeButton({
	walletConnected,
	disabled,
	onClick,
}: IssueNotarizeButtonProps) {
	const theme = useTheme();
	const label = !walletConnected
		? "Connect Wallet to Notarize"
		: "Notarize on Hedera";

	return (
		<Button
			fullWidth
			variant="contained"
			size="large"
			disabled={disabled}
			onClick={onClick}
			sx={{
				mt: 0.5,
				py: 1.25,
				fontWeight: 700,
				backgroundColor: theme.palette.primary.main,
				color: theme.palette.primary.contrastText,
				"&:hover": {
					backgroundColor: theme.palette.primary.dark,
				},
				"&.Mui-disabled": {
					backgroundColor: alpha(theme.palette.primary.main, 0.3),
					color: alpha(theme.palette.primary.contrastText, 0.5),
				},
			}}
		>
			{label}
		</Button>
	);
}
