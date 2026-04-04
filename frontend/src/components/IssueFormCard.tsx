import {
	Card,
	CardContent,
	Stack,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { scaleFadeUp } from "../utils/homeMotion";
import IssuePdfDropZone from "./IssuePdfDropZone";
import IssueHashPreview from "./IssueHashPreview";
import IssueNotarizeButton from "./IssueNotarizeButton";
import IssueSuccessCollapse from "./IssueSuccessCollapse";

export type IssueFormCardProps = {
	documentName: string;
	institutionName: string;
	recipientName: string;
	onDocumentNameChange: (value: string) => void;
	onInstitutionNameChange: (value: string) => void;
	onRecipientNameChange: (value: string) => void;
	hashing: boolean;
	fileLabel: string | null;
	hashError: string | null;
	hashHex: string | null;
	onPickFile: (file: File | undefined) => void;
	canNotarize: boolean;
	onNotarize: () => void;
	success: boolean;
	txId: string | null;
};

export default function IssueFormCard(props: IssueFormCardProps) {
	const theme = useTheme();
	const {
		documentName,
		institutionName,
		recipientName,
		onDocumentNameChange,
		onInstitutionNameChange,
		onRecipientNameChange,
		hashing,
		fileLabel,
		hashError,
		hashHex,
		onPickFile,
		canNotarize,
		onNotarize,
		success,
		txId,
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
						label="Document Name"
						variant="outlined"
						value={documentName}
						onChange={(e) => onDocumentNameChange(e.target.value)}
					/>
					<TextField
						fullWidth
						label="Institution Name"
						variant="outlined"
						value={institutionName}
						onChange={(e) => onInstitutionNameChange(e.target.value)}
					/>
					<TextField
						fullWidth
						label="Recipient Name"
						variant="outlined"
						value={recipientName}
						onChange={(e) => onRecipientNameChange(e.target.value)}
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

					<IssueNotarizeButton disabled={!canNotarize} onClick={onNotarize} />

					<IssueSuccessCollapse open={success} txId={txId} />
				</Stack>
			</CardContent>
		</Card>
	);
}
