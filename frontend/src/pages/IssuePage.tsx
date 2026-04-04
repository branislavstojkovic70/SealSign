import { Box, Grid } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import HomeShell from "../components/HomeShell";
import PageScrollArea from "../components/PageScrollArea";
import IssuePageHero from "../components/IssuePageHero";
import IssueFormCard from "../components/IssueFormCard";
import { sha256HexFromFile } from "../utils/hashFile";
import { isPdfFile } from "../utils/issueHelpers";
import { postIssue } from "../utils/issueApi";
import type { IssueApiResult } from "../utils/issueApi";
import { resolveEvmOrEns } from "../utils/sepoliaEns";

export default function IssuePage() {
	const { isConnected, address } = useAppKitAccount();
	const [documentName, setDocumentName] = useState("");
	const [issuerIdentity, setIssuerIdentity] = useState("");
	const [recipientIdentity, setRecipientIdentity] = useState("");
	const [fileLabel, setFileLabel] = useState<string | null>(null);
	const [hashHex, setHashHex] = useState<string | null>(null);
	const [hashError, setHashError] = useState<string | null>(null);
	const [hashing, setHashing] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [issueError, setIssueError] = useState<string | null>(null);
	const [issueResult, setIssueResult] = useState<IssueApiResult | null>(null);

	useEffect(() => {
		if (address) {
			setIssuerIdentity((prev) => (prev.trim() === "" ? address : prev));
		}
	}, [address]);

	const processFile = useCallback(async (file: File | undefined) => {
		if (!file) return;
		setHashError(null);
		setIssueError(null);
		setIssueResult(null);
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

	const handleNotarize = async () => {
		if (!hashHex) return;
		setIssueError(null);
		setSubmitting(true);
		try {
			const issuerResolved = await resolveEvmOrEns(issuerIdentity);
			if (!issuerResolved) {
				setIssueError(
					"Issuer: enter a valid Sepolia address (0x…) or resolveable ENS name.",
				);
				return;
			}
			const recipientResolved = await resolveEvmOrEns(recipientIdentity);
			if (!recipientResolved) {
				setIssueError(
					"Recipient: enter a valid Sepolia address (0x…) or resolveable ENS name.",
				);
				return;
			}

			const issuerRaw = issuerIdentity.trim();
			const recipientRaw = recipientIdentity.trim();
			const issuerEns = ethers.utils.isAddress(issuerRaw) ? undefined : issuerRaw;
			const recipientEns = ethers.utils.isAddress(recipientRaw) ? undefined : recipientRaw;

			const result = await postIssue({
				hash: hashHex,
				documentName: documentName.trim(),
				issuerAddress: issuerResolved,
				recipientAddress: recipientResolved,
				issuerEns,
				recipientEns,
			});
			setIssueResult(result);
		} catch (err) {
			setIssueError(err instanceof Error ? err.message : "Submission failed.");
		} finally {
			setSubmitting(false);
		}
	};

	const canNotarize =
		isConnected &&
		Boolean(hashHex) &&
		documentName.trim() !== "" &&
		issuerIdentity.trim() !== "" &&
		recipientIdentity.trim() !== "" &&
		!hashing &&
		!submitting &&
		!issueResult;

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
					<Box
						sx={{
							mt: { xs: 3, sm: 4 },
							width: "100%",
							display: "flex",
							justifyContent: "center",
						}}
					>
						<IssueFormCard
							documentName={documentName}
							issuerIdentity={issuerIdentity}
							recipientIdentity={recipientIdentity}
							onDocumentNameChange={setDocumentName}
							onIssuerIdentityChange={setIssuerIdentity}
							onRecipientIdentityChange={setRecipientIdentity}
							hashing={hashing}
							fileLabel={fileLabel}
							hashError={hashError}
							hashHex={hashHex}
							onPickFile={(f) => void processFile(f)}
							walletConnected={isConnected}
							canNotarize={canNotarize}
							onNotarize={() => void handleNotarize()}
							submitting={submitting}
							success={Boolean(issueResult)}
							transactionId={issueResult?.transactionId ?? null}
							sequenceNumber={issueResult?.sequenceNumber ?? null}
							explorerUrl={issueResult?.explorerUrl ?? null}
							issueError={issueError}
						/>
					</Box>
				</Grid>
			</HomeShell>
		</PageScrollArea>
	);
}
