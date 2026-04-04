import { Grid } from "@mui/material";
import { useCallback, useState } from "react";
import HomeShell from "../components/HomeShell";
import PageScrollArea from "../components/PageScrollArea";
import IssuePageHero from "../components/IssuePageHero";
import IssueFormCard from "../components/IssueFormCard";
import { sha256HexFromFile } from "../utils/hashFile";
import { isPdfFile, randomHederaStyleTxId } from "../utils/issueHelpers";

export default function IssuePage() {
	const [documentName, setDocumentName] = useState("");
	const [institutionName, setInstitutionName] = useState("");
	const [recipientName, setRecipientName] = useState("");
	const [fileLabel, setFileLabel] = useState<string | null>(null);
	const [hashHex, setHashHex] = useState<string | null>(null);
	const [hashError, setHashError] = useState<string | null>(null);
	const [hashing, setHashing] = useState(false);
	const [success, setSuccess] = useState(false);
	const [txId, setTxId] = useState<string | null>(null);

	const processFile = useCallback(async (file: File | undefined) => {
		if (!file) return;
		setHashError(null);
		setSuccess(false);
		setTxId(null);
		if (!isPdfFile(file)) {
			setFileLabel(null);
			setHashHex(null);
			setHashError("Please drop a PDF file.");
			return;
		}
		setFileLabel(file.name);
		setHashing(true);
		try {
			const hex = await sha256HexFromFile(file);
			setHashHex(hex);
		} catch {
			setHashHex(null);
			setHashError("Could not hash this file.");
		} finally {
			setHashing(false);
		}
	}, []);

	const handleNotarize = () => {
		setTxId(randomHederaStyleTxId());
		setSuccess(true);
	};

	const canNotarize = Boolean(hashHex) && !hashing && !success;

	return (
		<PageScrollArea>
			<HomeShell dense>
				<Grid
					size={{ xs: 12 }}
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
					}}
				>
					<IssuePageHero />
					<IssueFormCard
						documentName={documentName}
						institutionName={institutionName}
						recipientName={recipientName}
						onDocumentNameChange={setDocumentName}
						onInstitutionNameChange={setInstitutionName}
						onRecipientNameChange={setRecipientName}
						hashing={hashing}
						fileLabel={fileLabel}
						hashError={hashError}
						hashHex={hashHex}
						onPickFile={(f) => void processFile(f)}
						canNotarize={canNotarize}
						onNotarize={handleNotarize}
						success={success}
						txId={txId}
					/>
				</Grid>
			</HomeShell>
		</PageScrollArea>
	);
}
