import { Box, Chip, Grid, Stack, Typography, useTheme } from "@mui/material";
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

export default function HomeHero() {
	const theme = useTheme();

	return (
		<Grid size={{ xs: 12 }} sx={{ textAlign: "center", width: "100%" }}>
			<Stack
				direction="row"
				flexWrap="wrap"
				justifyContent="center"
				alignItems="center"
				gap={1}
				sx={{ mb: 2 }}
			>
				<Chip
					label="Hedera HCS · issuance"
					size="small"
					sx={chipSx(theme)}
					variant="outlined"
				/>
				<Chip
					label="Chainlink CRE · verification"
					size="small"
					sx={{
						...chipSx(theme),
						animation: `${fadeUp} 0.65s 0.06s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
					}}
					variant="outlined"
				/>
			</Stack>
			<Typography
				variant="h2"
				component="h1"
				sx={{
					mb: 2,
					fontSize: { xs: "1.65rem", sm: "2.15rem", md: "2.75rem" },
					lineHeight: 1.15,
					fontWeight: 700,
					letterSpacing: "-0.02em",
					color: theme.palette.text.primary,
					opacity: 0,
					animation: `${fadeUp} 0.7s 0.08s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
				}}
			>
				Immutable by Design.
				<Box
					component="span"
					sx={{
						display: "block",
						mt: 0.5,
						color: theme.palette.primary.light,
					}}
				>
					Trusted by Math.
				</Box>
			</Typography>
			<Typography
				variant="body1"
				color="text.secondary"
				sx={{
					maxWidth: 440,
					mx: "auto",
					lineHeight: 1.65,
					fontSize: { xs: "1.1rem", sm: "1.1rem" },
					opacity: 0,
					animation: `${fadeUp} 0.7s 0.2s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
				}}
			>
				Ditch the paper trail. Secure document fingerprints on Hedera and audit them instantly with Chainlink.
			</Typography>
		</Grid>
	);
}
