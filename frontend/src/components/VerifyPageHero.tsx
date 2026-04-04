import { Chip, Stack, Typography, useTheme } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { fadeUp } from "../utils/homeMotion";

const chipSx = (theme: Theme) => ({
	opacity: 0,
	animation: `${fadeUp} 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
	borderColor: alpha(theme.palette.primary.main, 0.45),
	color: theme.palette.primary.light,
	backgroundColor: alpha(theme.palette.primary.main, 0.08),
	fontWeight: 600,
	letterSpacing: "0.04em",
	fontSize: "0.7rem",
	textTransform: "uppercase" as const,
});

export default function VerifyPageHero() {
	const theme = useTheme();
	return (
		<>
			<Stack
				direction="row"
				flexWrap="wrap"
				justifyContent="center"
				gap={1}
				sx={{ width: "100%" }}
				mt = {3}
			>
				<Chip
					label="Hedera HCS · registry"
					size="small"
					variant="outlined"
					sx={chipSx(theme)}
				/>
				<Chip
					label="Chainlink CRE · verification"
					size="small"
					variant="outlined"
					sx={{
						...chipSx(theme),
						animation: `${fadeUp} 0.65s 0.06s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
					}}
				/>
			</Stack>

			<Typography
				variant="h4"
				component="h1"
				sx={{
					mt: { xs: 2, sm: 2.5 },
					fontWeight: 700,
					letterSpacing: "-0.02em",
					color: theme.palette.text.primary,
					fontSize: { xs: "1.35rem", sm: "1.5rem", md: "1.75rem" },
					opacity: 0,
					animation: `${fadeUp} 0.7s 0.06s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
				}}
			>
				Verify a document
			</Typography>
			<Typography
				variant="body2"
				color="text.secondary"
				sx={{
					mt: { xs: 1.5, sm: 2 },
					maxWidth: 440,
					mx: "auto",
					lineHeight: 1.6,
					opacity: 0,
					animation: `${fadeUp} 0.7s 0.12s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
				}}
				mb = {2}
			>
				Hash the PDF in your browser, then we check the mirror record through the same
				CRE path as production.
			</Typography>
		</>
	);
}
