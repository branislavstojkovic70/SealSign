import { Box, Collapse, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { VerifyApiResponse } from "../utils/verifyApi";

type VerifyResultPanelProps = {
	open: boolean;
	errorMessage: string | null;
	result: VerifyApiResponse | null;
	showSepoliaEns: boolean;
};

function StackedRow({ label, value }: { label: string; value: string | null }) {
	if (value == null || value === "") return null;
	return (
		<Typography variant="body2" sx={{ mb: 0.5, color: "text.primary" }}>
			<Box component="span" sx={{ color: "text.disabled", mr: 0.5 }}>
				{label}:
			</Box>
			{value}
		</Typography>
	);
}

export default function VerifyResultPanel({
	open,
	errorMessage,
	result,
	showSepoliaEns,
}: VerifyResultPanelProps) {
	const theme = useTheme();
	const issuerEns = result?.verified ? (result.issuerEns ?? null) : null;
	const recipientEns = result?.verified ? (result.recipientEns ?? null) : null;

	if (errorMessage) {
		return (
			<Collapse in={open} timeout="auto">
				<Box
					sx={{
						mt: 1,
						p: 2,
						borderRadius: 2,
						backgroundColor: alpha(theme.palette.error.main, 0.12),
						border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
					}}
				>
					<Typography variant="subtitle2" color="error" fontWeight={700} sx={{ mb: 0.5 }}>
						Verification error
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{errorMessage}
					</Typography>
				</Box>
			</Collapse>
		);
	}

	if (!result) return null;

	if (!result.verified) {
		return (
			<Collapse in={open} timeout="auto">
				<Box
					sx={{
						mt: 1,
						p: 2,
						borderRadius: 2,
						backgroundColor: alpha(theme.palette.error.main, 0.1),
						border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
					}}
				>
					<Typography variant="subtitle2" color="error" fontWeight={700} sx={{ mb: 0.5 }}>
						Not verified
					</Typography>
					<Typography variant="body2" color="text.secondary">
						{result.message}
					</Typography>
				</Box>
			</Collapse>
		);
	}

	return (
		<Collapse in={open} timeout="auto">
			<Box
				sx={{
					mt: 1,
					p: 2,
					borderRadius: 2,
					backgroundColor: alpha(theme.palette.success.main, 0.12),
					border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`,
				}}
			>
				<Typography
					variant="subtitle2"
					color="success.main"
					fontWeight={700}
					sx={{ mb: 1 }}
				>
					Verified on Hedera HCS
				</Typography>
				<StackedRow label="Issuer" value={result.issuer} />
				{showSepoliaEns && issuerEns ? (
					<StackedRow label="Issuer ENS" value={issuerEns} />
				) : null}
				<StackedRow label="Document" value={result.documentType} />
				<StackedRow label="Recipient" value={result.recipient} />
				{showSepoliaEns && recipientEns ? (
					<StackedRow label="Recipient ENS" value={recipientEns} />
				) : null}
				<StackedRow label="Issued" value={result.issuedAt} />
				{result.hederaSequence != null ? (
					<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
						HCS sequence:{" "}
						<Box component="span" sx={{ fontFamily: "monospace", color: "text.primary" }}>
							{result.hederaSequence}
						</Box>
					</Typography>
				) : null}
			</Box>
		</Collapse>
	);
}
