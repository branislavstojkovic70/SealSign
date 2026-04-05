import { Grid } from "@mui/material";
import { useCallback, useState } from "react";
import HomeShell from "../components/HomeShell";
import PageScrollArea from "../components/PageScrollArea";
import VerifyPageHero from "../components/VerifyPageHero";
import VerifyFormCard from "../components/VerifyFormCard";
import { sha256HexFromFile } from "../utils/hashFile";
import { isPdfFile } from "../utils/issueHelpers";
import { postVerify, type VerifyApiResponse } from "../utils/verifyApi";

export default function VerifyPage() {
	const [fileLabel, setFileLabel] = useState<string | null>(null);
	const [hashHex, setHashHex] = useState<string | null>(null);
	const [hashError, setHashError] = useState<string | null>(null);
	const [hashing, setHashing] = useState(false);
	const [verifying, setVerifying] = useState(false);
	const [verifyError, setVerifyError] = useState<string | null>(null);
	const [result, setResult] = useState<VerifyApiResponse | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [showSepoliaEns, setShowSepoliaEns] = useState(false);

	const processFile = useCallback(async (file: File | undefined) => {
		if (!file) return;
		setHashError(null);
		setVerifyError(null);
		setResult(null);
		setShowResult(false);
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

	const handleVerify = async () => {
		if (!hashHex) return;
		setVerifying(true);
		setVerifyError(null);
		setResult(null);
		setShowResult(false);
		try {
			const data = await postVerify(hashHex);
			setResult(data);
			setShowResult(true);
		} catch (e) {
			setVerifyError(e instanceof Error ? e.message : "Request failed");
			setShowResult(true);
		} finally {
			setVerifying(false);
		}
	};

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
					<VerifyPageHero />
					<VerifyFormCard
						hashing={hashing}
						fileLabel={fileLabel}
						hashError={hashError}
						hashHex={hashHex}
						onPickFile={(f) => void processFile(f)}
						verifying={verifying}
						onVerify={() => void handleVerify()}
						showResult={showResult}
						verifyError={verifyError}
						result={result}
						showSepoliaEns={showSepoliaEns}
						onShowSepoliaEnsChange={setShowSepoliaEns}
					/>
				</Grid>
			</HomeShell>
		</PageScrollArea>
	);
}
