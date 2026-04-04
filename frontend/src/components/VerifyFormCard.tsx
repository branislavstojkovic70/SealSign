import {
	Card,
	CardContent,
	FormControlLabel,
	Stack,
	Switch,
	Typography,
	useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { scaleFadeUp } from "../utils/homeMotion";
import type { VerifyApiResponse } from "../utils/verifyApi";
import IssuePdfDropZone from "./IssuePdfDropZone";
import IssueHashPreview from "./IssueHashPreview";
import VerifySubmitButton from "./VerifySubmitButton";
import VerifyResultPanel from "./VerifyResultPanel";

export type VerifyFormCardProps = {
	hashing: boolean;
	fileLabel: string | null;
	hashError: string | null;
	hashHex: string | null;
	onPickFile: (file: File | undefined) => void;
	verifying: boolean;
	onVerify: () => void;
	showResult: boolean;
	verifyError: string | null;
	result: VerifyApiResponse | null;
	showSepoliaEns: boolean;
	onShowSepoliaEnsChange: (value: boolean) => void;
};

export default function VerifyFormCard(props: VerifyFormCardProps) {
	const theme = useTheme();
	const {
		hashing,
		fileLabel,
		hashError,
		hashHex,
		onPickFile,
		verifying,
		onVerify,
		showResult,
		verifyError,
		result,
		showSepoliaEns,
		onShowSepoliaEnsChange,
	} = props;

	const canVerify = Boolean(hashHex) && !hashing && !verifying;

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

					<FormControlLabel
						control={
							<Switch
								checked={showSepoliaEns}
								onChange={(_, c) => onShowSepoliaEnsChange(c)}
								color="primary"
							/>
						}
						label="Show Sepolia ENS (issuer & recipient reverse lookup)"
					/>

					<VerifySubmitButton
						disabled={!canVerify}
						loading={verifying}
						onClick={onVerify}
					/>

					<VerifyResultPanel
						open={showResult}
						errorMessage={verifyError}
						result={verifyError ? null : result}
						showSepoliaEns={showSepoliaEns}
					/>
				</Stack>
			</CardContent>
		</Card>
	);
}
