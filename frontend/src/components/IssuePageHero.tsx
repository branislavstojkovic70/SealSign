import { Chip, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { fadeUp } from "../utils/homeMotion";

export default function IssuePageHero() {
	const theme = useTheme();
	return (
		<>
			<Stack
				direction="row"
				flexWrap="wrap"
				justifyContent="center"
				gap={1}
				sx={{ mb: 0.75, width: "100%" }}
			>
				<Chip
					label="Hedera HCS · issuance"
					size="small"
					variant="outlined"
					sx={{
						opacity: 0,
						animation: `${fadeUp} 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
						borderColor: alpha(theme.palette.primary.main, 0.45),
						color: theme.palette.primary.light,
						backgroundColor: alpha(theme.palette.primary.main, 0.08),
						fontWeight: 600,
						letterSpacing: "0.04em",
						fontSize: "0.7rem",
						textTransform: "uppercase",
					}}
				/>
			</Stack>

			<Typography
				variant="h4"
				component="h1"
				sx={{
					mb: 1.25,
					fontWeight: 700,
					letterSpacing: "-0.02em",
					color: theme.palette.text.primary,
					fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.75rem" },
					opacity: 0,
					animation: `${fadeUp} 0.7s 0.06s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
				}}
			>
				Issue a document
			</Typography>
		</>
	);
}
