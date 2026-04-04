import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRef } from "react";
import { UploadFile } from "@mui/icons-material";

type IssuePdfDropZoneProps = {
	hashing: boolean;
	fileLabel: string | null;
	onPickFile: (file: File | undefined) => void;
};

export default function IssuePdfDropZone({
	hashing,
	fileLabel,
	onPickFile,
}: IssuePdfDropZoneProps) {
	const theme = useTheme();
	const inputRef = useRef<HTMLInputElement>(null);

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const f = e.target.files?.[0];
		onPickFile(f);
		e.target.value = "";
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onPickFile(e.dataTransfer.files?.[0]);
	};

	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	return (
		<>
			<input
				ref={inputRef}
				type="file"
				accept="application/pdf,.pdf"
				hidden
				onChange={onInputChange}
			/>
			<Box
				onDrop={onDrop}
				onDragOver={onDragOver}
				onClick={() => inputRef.current?.click()}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						inputRef.current?.click();
					}
				}}
				role="button"
				tabIndex={0}
				aria-label="PDF drop zone"
				sx={{
					minHeight: 160,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					gap: 1,
					px: 2,
					py: 3,
					borderRadius: 2,
					border: `2px dashed ${theme.palette.divider}`,
					cursor: "pointer",
					transition: theme.transitions.create(
						["border-color", "background-color"],
						{ duration: theme.transitions.duration.shorter },
					),
					"&:hover": {
						borderColor: alpha(theme.palette.primary.main, 0.5),
						backgroundColor: alpha(theme.palette.primary.main, 0.04),
					},
				}}
			>
				<UploadFile
					sx={{ fontSize: 40, color: theme.palette.primary.main }}
					aria-hidden
				/>
				<Typography variant="body2" color="text.secondary">
					{hashing
						? "Hashing…"
						: fileLabel
							? fileLabel
							: "Drop PDF here or click to browse"}
				</Typography>
			</Box>
		</>
	);
}
