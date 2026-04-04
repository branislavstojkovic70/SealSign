import { Card, CardContent, Stack, TextField, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { scaleFadeUp } from "../utils/homeMotion";
import IssuePdfDropZone from "./IssuePdfDropZone";
import IssueHashPreview from "./IssueHashPreview";
import IssueNotarizeButton from "./IssueNotarizeButton";
import IssueSuccessCollapse from "./IssueSuccessCollapse";

export type IssueFormCardProps = {
	documentName: string;
	issuerIdentity: string;
	recipientIdentity: string;
	onDocumentNameChange: (value: string) => void;
	onIssuerIdentityChange: (value: string) => void;
	onRecipientIdentityChange: (value: string) => void;
	hashing: boolean;
	fileLabel: string | null;
	hashError: string | null;
	hashHex: string | null;
	onPickFile: (file: File | undefined) => void;
	walletConnected: boolean;
	canNotarize: boolean;
	onNotarize: () => void;
	submitting: boolean;
	success: boolean;
	transactionId: string | null;
	sequenceNumber: number | null;
	explorerUrl: string | null;
	issueError: string | null;
	notarizeLabel?: string;
	paymentHint?: string | null;
	paymentHintSeverity?: "info" | "error";
};

export default function IssueFormCard(props: IssueFormCardProps) {
	const theme = useTheme();
	const {
		documentName,
		issuerIdentity,
		recipientIdentity,
		onDocumentNameChange,
		onIssuerIdentityChange,
		onRecipientIdentityChange,
		hashing,
		fileLabel,
		hashError,
		hashHex,
		onPickFile,
		walletConnected,
		canNotarize,
		onNotarize,
		submitting,
		success,
		transactionId,
		sequenceNumber,
		explorerUrl,
		issueError,
		notarizeLabel,
		paymentHint,
		paymentHintSeverity = "info",
	} = props;

	return (
		<Card
			elevation={0}
			sx={{
				width: "100%",
				maxWidth: 560,
				textAlign: "left",
				borderRadius: 3,
				border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
				backgroundColor: alpha(theme.palette.background.paper, 0.85),
				backdropFilter: "blur(10px)",
				opacity: 0,
				animation: `${scaleFadeUp} 0.65s 0.18s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
			}}
		>
			<CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
				<Stack spacing={2.5}>
					<TextField
						fullWidth
						label="Document name"
						variant="outlined"
						value={documentName}
						onChange={(e) => onDocumentNameChange(e.target.value)}
					/>
					<TextField
						fullWidth
						label="Issuer (wallet address or Sepolia ENS)"
						placeholder="0x… or name.eth"
						variant="outlined"
						value={issuerIdentity}
						onChange={(e) => onIssuerIdentityChange(e.target.value)}
						helperText="Defaults from your connected wallet; edit to use ENS or another address."
					/>
					<TextField
						fullWidth
						label="Recipient (wallet address or Sepolia ENS)"
						placeholder="0x… or name.eth"
						variant="outlined"
						value={recipientIdentity}
						onChange={(e) => onRecipientIdentityChange(e.target.value)}
					/>

					<IssuePdfDropZone
						hashing={hashing}
						fileLabel={fileLabel}
						onPickFile={onPickFile}
					/>

					{hashError ? (
						<Typography variant="caption" color="error">
							{hashError}
						</Typography>
					) : null}

					{hashHex ? <IssueHashPreview hashHex={hashHex} /> : null}

					<Typography variant="caption" color="text.secondary">
						The SHA-256 hash above is the only fingerprint sent to Hedera with issuer, recipient,
						and document name — the PDF never leaves your browser.
					</Typography>

					{paymentHint ? (
						<Typography
							variant="caption"
							color={paymentHintSeverity === "error" ? "error" : "text.secondary"}
							sx={{ display: "block" }}
						>
							{paymentHint}
						</Typography>
					) : null}

					<IssueNotarizeButton
						walletConnected={walletConnected}
						disabled={!canNotarize || submitting}
						onClick={onNotarize}
						connectedLabel={notarizeLabel}
					/>

					{issueError && (
						<Typography variant="caption" color="error">
							{issueError}
						</Typography>
					)}

					<IssueSuccessCollapse
						open={success}
						transactionId={transactionId}
						sequenceNumber={sequenceNumber}
						explorerUrl={explorerUrl}
					/>
				</Stack>
			</CardContent>
		</Card>
	);
}
