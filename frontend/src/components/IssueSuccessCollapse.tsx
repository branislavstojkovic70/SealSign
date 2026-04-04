import { Box, Collapse, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

type IssueSuccessCollapseProps = {
	open: boolean;
	txId: string | null;
};

export default function IssueSuccessCollapse({
	open,
	txId,
}: IssueSuccessCollapseProps) {
	const theme = useTheme();
	return (
		<Collapse in={open} timeout="auto">
			<Box
				sx={{
					mt: 1,
					p: 2,
					borderRadius: 2,
					backgroundColor: alpha(theme.palette.success.main, 0.12),
					border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
				}}
			>
				<Typography
					variant="subtitle2"
					color="success.main"
					fontWeight={700}
					sx={{ mb: 1 }}
				>
					Submitted to Hedera (simulated)
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
					Your document hash is queued for consensus. Save this transaction ID for
					your records.
				</Typography>
				<Typography
					variant="body2"
					sx={{
						fontFamily: "monospace",
						fontSize: "0.8rem",
						wordBreak: "break-all",
						color: theme.palette.text.primary,
					}}
				>
					{txId}
				</Typography>
			</Box>
		</Collapse>
	);
}
