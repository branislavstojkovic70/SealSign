import { Search } from "@mui/icons-material";
import {
	Box,
	Chip,
	CircularProgress,
	Grid,
	InputAdornment,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Typography,
	useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useAppKitAccount } from "@reown/appkit/react";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import HomeShell from "../components/HomeShell";
import PageScrollArea from "../components/PageScrollArea";
import { fadeUp, liveDotPulse, scaleFadeUp } from "../utils/homeMotion";
import { fetchHcsMessages } from "../utils/archiveApi";

export type AuditLogRow = {
	id: string;
	status: "Sealed" | "Recorded" | "Anchored";
	documentType: string;
	issuerEns: string;
	timestamp: string;
	/** Full SHA-256 hex — filter target. */
	documentHash: string;
};


const DEFAULT_ROWS_PER_PAGE = 5;
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25] as const;

type AuditSortMode = "newest" | "oldest" | "document_az";

const SORT_OPTIONS: { mode: AuditSortMode; label: string }[] = [
	{ mode: "newest", label: "Last added" },
	{ mode: "oldest", label: "Oldest first" },
	{ mode: "document_az", label: "Document A–Z" },
];

function ts(row: AuditLogRow) {
	return new Date(row.timestamp).getTime();
}

function formatDisplayTime(iso: string) {
	try {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(iso));
	} catch {
		return iso;
	}
}

/** Table preview only; full hex via `title` on the cell. */
function formatHashPreview(hex: string, headChars = 10, tailChars = 6) {
	const h = hex.replace(/^0x/i, "");
	if (h.length <= headChars + tailChars + 1) return h;
	return `${h.slice(0, headChars)}…${h.slice(-tailChars)}`;
}

function statusChipColor(
	status: AuditLogRow["status"],
): "success" | "default" | "primary" {
	if (status === "Sealed") return "success";
	if (status === "Anchored") return "primary";
	return "default";
}

export default function ArchivePage() {
	const theme = useTheme();
	const { isConnected, address } = useAppKitAccount();
	const [rows, setRows] = useState<AuditLogRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [fetchError, setFetchError] = useState<string | null>(null);
	const [hashQuery, setHashQuery] = useState("");
	const [sortMode, setSortMode] = useState<AuditSortMode>("newest");
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

	useEffect(() => {
		if (!isConnected || !address) return;
		setLoading(true);
		fetchHcsMessages(address)
			.then((messages) => {
				setRows(
					messages.map((msg) => ({
						id: String(msg.sequenceNumber),
						status: "Sealed" as const,
						documentType: msg.document.type,
						issuerEns: msg.document.issuer,
						timestamp: msg.document.issuedAt,
						documentHash: msg.document.hash,
					})),
				);
			})
			.catch((err: unknown) => {
				setFetchError(err instanceof Error ? err.message : "Failed to load archive");
			})
			.finally(() => setLoading(false));
	}, []);

	const filtered = useMemo(() => {
		const q = hashQuery.trim().toLowerCase().replace(/^0x/i, "");
		if (!q) return rows;
		return rows.filter((row) =>
			row.documentHash.toLowerCase().includes(q),
		);
	}, [hashQuery, rows]);

	const sorted = useMemo(() => {
		const copy = [...filtered];
		if (sortMode === "newest") {
			copy.sort((a, b) => ts(b) - ts(a));
		} else if (sortMode === "oldest") {
			copy.sort((a, b) => ts(a) - ts(b));
		} else {
			copy.sort((a, b) =>
				a.documentType.localeCompare(b.documentType, undefined, {
					sensitivity: "base",
				}),
			);
		}
		return copy;
	}, [filtered, sortMode]);

	const pagedRows = useMemo(
		() =>
			sorted.slice(
				page * rowsPerPage,
				page * rowsPerPage + rowsPerPage,
			),
		[sorted, page, rowsPerPage],
	);

	useEffect(() => {
		setPage(0);
	}, [hashQuery, sortMode]);

	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (e: ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(parseInt(e.target.value, 10));
		setPage(0);
	};

	const copyDocumentHash = useCallback(async (hex: string) => {
		try {
			await navigator.clipboard.writeText(hex);
			toast.success("Hash copied to clipboard");
		} catch {
			toast.error("Could not copy hash");
		}
	}, []);

	return (
		<PageScrollArea>
			<HomeShell dense>
				<Grid
					size={{ xs: 12 }}
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "stretch",
						maxWidth: 960,
						mx: "auto",
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexDirection: { xs: "column", sm: "row" },
							alignItems: { xs: "stretch", sm: "flex-start" },
							justifyContent: "space-between",
							gap: 2,
							width: "100%",
						}}
					>
						<Box sx={{ flex: "1 1 auto", minWidth: 0 }}>
							<Typography
								variant="h4"
								component="h1"
								sx={{
									mt: 0,
									fontWeight: 700,
									letterSpacing: "-0.02em",
									color: theme.palette.text.primary,
									fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.75rem" },
									opacity: 0,
									animation: `${fadeUp} 0.7s 0.06s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
								}}
							>
								Public audit log
							</Typography>
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{
									mt: { xs: 1.5, sm: 2 },
									maxWidth: 520,
									lineHeight: 1.6,
									opacity: 0,
									animation: `${fadeUp} 0.7s 0.12s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
								}}
							>
								Recent document hashes anchored on Hedera HCS. Filter by hash to
								match mirror-node payloads.
							</Typography>
						</Box>

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: 1,
								alignSelf: { xs: "flex-end", sm: "flex-start" },
								mt: { xs: 0, sm: 0.5 },
								px: 1.5,
								py: 0.75,
								borderRadius: 2,
								border: `1px solid ${alpha(theme.palette.success.main, 0.35)}`,
								backgroundColor: alpha(theme.palette.success.main, 0.08),
							}}
						>
							<Box
								aria-hidden
								sx={{
									width: 10,
									height: 10,
									borderRadius: "50%",
									backgroundColor: "#10B981",
									animation: `${liveDotPulse} 1.8s ease-in-out infinite`,
								}}
							/>
							<Typography
								variant="caption"
								sx={{
									mt: 0,
									fontWeight: 600,
									letterSpacing: "0.04em",
									textTransform: "uppercase",
									color: alpha(theme.palette.success.light, 0.95),
								}}
							>
								Live Audit Feed
							</Typography>
						</Box>
					</Box>

					<TextField
						fullWidth
						size="small"
						placeholder="Filter by document hash (hex)…"
						value={hashQuery}
						onChange={(e) => setHashQuery(e.target.value)}
						slotProps={{
							input: {
								startAdornment: (
									<InputAdornment position="start">
										<Search
											sx={{
												color: theme.palette.text.secondary,
												fontSize: 20,
											}}
										/>
									</InputAdornment>
								),
							},
						}}
						sx={{
							mt: { xs: 2.5, sm: 3 },
							"& .MuiOutlinedInput-root": {
								borderRadius: 2,
								backgroundColor: alpha(theme.palette.background.paper, 0.65),
								backdropFilter: "blur(8px)",
								"& fieldset": {
									borderColor: alpha(theme.palette.primary.main, 0.2),
								},
								"&:hover fieldset": {
									borderColor: alpha(theme.palette.primary.main, 0.35),
								},
								"&.Mui-focused fieldset": {
									borderColor: theme.palette.primary.main,
								},
							},
							"& .MuiInputBase-input::placeholder": {
								color: theme.palette.text.disabled,
								opacity: 1,
							},
						}}
					/>

					<Box
						sx={{
							mt: { xs: 2, sm: 2.5 },
							display: "flex",
							flexDirection: { xs: "column", sm: "row" },
							alignItems: { xs: "stretch", sm: "center" },
							justifyContent: "space-between",
							gap: 1.5,
							flexWrap: "wrap",
						}}
					>
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{
								mt: 0,
								alignSelf: { xs: "flex-start", sm: "center" },
								fontWeight: 600,
								letterSpacing: "0.06em",
								textTransform: "uppercase",
							}}
						>
							Order
						</Typography>
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: 1,
							}}
						>
							{SORT_OPTIONS.map(({ mode, label }) => {
								const selected = sortMode === mode;
								return (
									<Chip
										key={mode}
										label={label}
										onClick={() => setSortMode(mode)}
										color={selected ? "primary" : "default"}
										variant={selected ? "filled" : "outlined"}
										size="small"
										sx={{ fontWeight: 600 }}
									/>
								);
							})}
						</Box>
					</Box>

					{!isConnected && (
						<Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
							<appkit-button />
						</Box>
					)}

					{isConnected && loading && (
						<Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
							<CircularProgress size={32} sx={{ color: "#10B981" }} />
						</Box>
					)}

					{isConnected && fetchError && !loading && (
						<Typography variant="body2" color="error" sx={{ mt: 3 }}>
							{fetchError}
						</Typography>
					)}

					{isConnected && !loading && !fetchError && (
					<TableContainer
						component={Paper}
						elevation={0}
						sx={{
							mt: { xs: 2, sm: 2.5 },
							width: "100%",
							borderRadius: 3,
							border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
							backgroundColor: alpha(theme.palette.background.paper, 0.85),
							backdropFilter: "blur(10px)",
							opacity: 0,
							animation: `${scaleFadeUp} 0.65s 0.18s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
							overflowX: "auto",
						}}
					>
						<Table
							stickyHeader
							aria-label="Hedera HCS audit log"
							sx={{
								"& .MuiTableCell-head": {
									py: 1.75,
								},
								"& .MuiTableCell-body": {
									py: 2,
								},
							}}
						>
							<TableHead>
								<TableRow>
									<TableCell
										sx={{
											fontWeight: 700,
											color: theme.palette.text.secondary,
											borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
											backgroundColor: alpha(theme.palette.background.paper, 0.95),
										}}
									>
										Status
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 700,
											color: theme.palette.text.secondary,
											borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
											backgroundColor: alpha(theme.palette.background.paper, 0.95),
										}}
									>
										Document Type
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 700,
											color: theme.palette.text.secondary,
											borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
											backgroundColor: alpha(theme.palette.background.paper, 0.95),
										}}
									>
										Hash
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 700,
											color: theme.palette.text.secondary,
											borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
											backgroundColor: alpha(theme.palette.background.paper, 0.95),
										}}
									>
										Issuer (ENS)
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 700,
											color: theme.palette.text.secondary,
											borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
											backgroundColor: alpha(theme.palette.background.paper, 0.95),
										}}
									>
										Timestamp
									</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{sorted.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} sx={{ py: 4, textAlign: "center" }}>
											<Typography variant="body2" color="text.secondary">
												No rows match this hash.
											</Typography>
										</TableCell>
									</TableRow>
								) : (
									pagedRows.map((row) => (
										<TableRow
											key={row.id}
											hover
											sx={{
												"&:last-child td": { borderBottom: 0 },
												"&:hover": {
													backgroundColor: alpha(
														theme.palette.primary.main,
														0.06,
													),
												},
											}}
										>
											<TableCell sx={{ borderColor: alpha(theme.palette.divider, 0.6) }}>
												<Chip
													label={row.status}
													size="small"
													color={statusChipColor(row.status)}
													variant="outlined"
													sx={{ fontWeight: 600 }}
												/>
											</TableCell>
											<TableCell
												sx={{
													borderColor: alpha(theme.palette.divider, 0.6),
													color: theme.palette.text.primary,
													fontWeight: 500,
												}}
											>
												{row.documentType}
											</TableCell>
											<TableCell
												title={`${row.documentHash} — click to copy`}
												role="button"
												tabIndex={0}
												aria-label="Copy document hash to clipboard"
												onClick={() => void copyDocumentHash(row.documentHash)}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														e.preventDefault();
														void copyDocumentHash(row.documentHash);
													}
												}}
												sx={{
													borderColor: alpha(theme.palette.divider, 0.6),
													fontFamily: "monospace",
													fontSize: "0.8rem",
													color: theme.palette.text.secondary,
													whiteSpace: "nowrap",
													maxWidth: 160,
													cursor: "pointer",
													userSelect: "none",
													"&:focus-visible": {
														outline: `2px solid ${theme.palette.primary.main}`,
														outlineOffset: 2,
													},
													"&:active": {
														opacity: 0.85,
													},
												}}
											>
												{formatHashPreview(row.documentHash)}
											</TableCell>
											<TableCell
												sx={{
													borderColor: alpha(theme.palette.divider, 0.6),
													fontFamily: "monospace",
													fontSize: "0.8rem",
													color: theme.palette.primary.light,
												}}
											>
												{row.issuerEns}
											</TableCell>
											<TableCell
												sx={{
													borderColor: alpha(theme.palette.divider, 0.6),
													color: theme.palette.text.secondary,
													whiteSpace: "nowrap",
												}}
											>
												{formatDisplayTime(row.timestamp)}
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
						<TablePagination
							component="div"
							count={sorted.length}
							page={page}
							onPageChange={handleChangePage}
							rowsPerPage={rowsPerPage}
							onRowsPerPageChange={handleChangeRowsPerPage}
							rowsPerPageOptions={[...ROWS_PER_PAGE_OPTIONS]}
							labelRowsPerPage="Rows"
							sx={{
								borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
								backgroundColor: alpha(theme.palette.background.paper, 0.92),
								color: theme.palette.text.secondary,
								"& .MuiTablePagination-toolbar": {
									flexWrap: "wrap",
									gap: 1,
									px: { xs: 1, sm: 2 },
									py: 1,
								},
								"& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
									{
										color: theme.palette.text.secondary,
									},
								"& .MuiTablePagination-select": {
									color: theme.palette.text.primary,
								},
								"& .MuiIconButton-root": {
									color: theme.palette.text.secondary,
									"&:disabled": {
										color: theme.palette.action.disabled,
									},
								},
							}}
						/>
					</TableContainer>
					)}
				</Grid>
			</HomeShell>
		</PageScrollArea>
	);
}
