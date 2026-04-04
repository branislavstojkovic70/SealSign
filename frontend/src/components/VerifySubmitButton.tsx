import { Button, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

type VerifySubmitButtonProps = {
	disabled: boolean;
	loading: boolean;
	onClick: () => void;
};

export default function VerifySubmitButton({
	disabled,
	loading,
	onClick,
}: VerifySubmitButtonProps) {
	const theme = useTheme();
	return (
		<Button
			fullWidth
			variant="contained"
			size="large"
			disabled={disabled || loading}
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
			{loading ? "Verifying…" : "Verify with Chainlink CRE"}
		</Button>
	);
}
