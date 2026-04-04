import { Box, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";

type IssueHashPreviewProps = {
	hashHex: string;
};

export default function IssueHashPreview({ hashHex }: IssueHashPreviewProps) {
	const theme = useTheme();
	return (
		<Box
			sx={{
				p: 1.5,
				borderRadius: 1,
				backgroundColor: alpha(theme.palette.primary.main, 0.08),
				border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
			}}
		>
			<Typography
				variant="caption"
				color="text.secondary"
				display="block"
				sx={{ mb: 0.5 }}
			>
				SHA-256 (hex)
			</Typography>
			<Typography
				variant="body2"
				sx={{
					fontFamily: "monospace",
					fontSize: "0.75rem",
					wordBreak: "break-all",
					lineHeight: 1.5,
					color: theme.palette.text.primary,
				}}
			>
				{hashHex}
			</Typography>
		</Box>
	);
}
