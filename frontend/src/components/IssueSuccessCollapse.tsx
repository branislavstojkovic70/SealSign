import { Box, Collapse, Link, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

type IssueSuccessCollapseProps = {
	open: boolean;
	transactionId: string | null;
	sequenceNumber: number | null;
	explorerUrl: string | null;
};

export default function IssueSuccessCollapse({
	open,
	transactionId,
	sequenceNumber,
	explorerUrl,
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
					Submitted to Hedera HCS
				</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
					Your document hash has reached consensus. Save this transaction ID for
					your records.
				</Typography>
				{sequenceNumber !== null && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
						Sequence #{sequenceNumber}
					</Typography>
				)}
				<Typography
					variant="body2"
					sx={{
						fontFamily: "monospace",
						fontSize: "0.8rem",
						wordBreak: "break-all",
						color: theme.palette.text.primary,
						mb: explorerUrl ? 1 : 0,
					}}
				>
					{transactionId}
				</Typography>
				{explorerUrl && (
					<Link
						href={explorerUrl}
						target="_blank"
						rel="noopener noreferrer"
						variant="body2"
						color="success.main"
					>
						View on HashScan ↗
					</Link>
				)}
			</Box>
		</Collapse>
	);
}
