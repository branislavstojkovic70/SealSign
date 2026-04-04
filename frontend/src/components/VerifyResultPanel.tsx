import { Box, Collapse, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import type { VerifyApiResponse } from "../utils/verifyApi";
import { lookupSepoliaPrimary } from "../utils/sepoliaEns";

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
	const [issuerPrimaryEns, setIssuerPrimaryEns] = useState<string | null>(null);
	const [recipientPrimaryEns, setRecipientPrimaryEns] = useState<string | null>(null);
	const [ensBusy, setEnsBusy] = useState(false);

	useEffect(() => {
		if (!open || !result?.verified || !showSepoliaEns) {
			setIssuerPrimaryEns(null);
			setRecipientPrimaryEns(null);
			setEnsBusy(false);
			return;
		}
		const issuerAddr = result.issuerAddress ?? null;
		const recipientAddr = result.recipientAddress ?? null;
		let cancelled = false;
		setEnsBusy(true);
		void Promise.all([
			issuerAddr ? lookupSepoliaPrimary(issuerAddr) : Promise.resolve(null),
			recipientAddr ? lookupSepoliaPrimary(recipientAddr) : Promise.resolve(null),
		]).then(([iName, rName]) => {
			if (!cancelled) {
				setIssuerPrimaryEns(iName);
				setRecipientPrimaryEns(rName);
				setEnsBusy(false);
			}
		});
		return () => {
			cancelled = true;
		};
	}, [open, result, showSepoliaEns]);

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
					Verified on ledger
				</Typography>
				<StackedRow label="Issuer" value={result.issuer} />
				{showSepoliaEns ? (
					<Typography variant="body2" sx={{ mb: 0.5, color: "text.primary" }}>
						<Box component="span" sx={{ color: "text.disabled", mr: 0.5 }}>
							Issuer primary (Sepolia ENS):
						</Box>
						{ensBusy
							? "…"
							: issuerPrimaryEns ?? "No primary name (or no issuer address on record)"}
					</Typography>
				) : null}
				<StackedRow label="Document" value={result.documentType} />
				<StackedRow label="Recipient" value={result.recipient} />
				{showSepoliaEns ? (
					<Typography variant="body2" sx={{ mb: 0.5, color: "text.primary" }}>
						<Box component="span" sx={{ color: "text.disabled", mr: 0.5 }}>
							Recipient (Sepolia ENS):
						</Box>
						{ensBusy
							? "…"
							: recipientPrimaryEns ?? "No primary name (or no recipient address on record)"}
					</Typography>
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
