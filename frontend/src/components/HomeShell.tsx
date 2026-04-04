import { Box, Container, Grid, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import { haloPulse } from "../utils/homeMotion";

type HomeShellProps = {
	children: ReactNode;
	/** Tighter top spacing for long forms (Issue / Verify). */
	dense?: boolean;
};

export default function HomeShell({ children, dense = false }: HomeShellProps) {
	const theme = useTheme();
	const py = dense ? { xs: 1.5, md: 2 } : { xs: 5, md: 8 };
	const gridSpacing = dense ? { xs: 2, md: 2.5 } : { xs: 4, md: 5 };
	return (
		<Box
			sx={{
				position: "relative",
				flex: 1,
				width: "100%",
				minHeight: "min-content",
				overflowX: "hidden",
				overflowY: "visible",
				backgroundColor: theme.palette.background.default,
				py,
				pb: dense ? { xs: 3, md: 4 } : undefined,
			}}
		>
			<Box
				aria-hidden
				sx={{
					pointerEvents: "none",
					position: "absolute",
					top: { xs: "-8%", md: "-12%" },
					left: "50%",
					width: { xs: "140%", md: "90%" },
					maxWidth: 900,
					height: { xs: 320, md: 420 },
					borderRadius: "50%",
					background: `radial-gradient(ellipse at center, ${alpha(theme.palette.primary.main, 0.22)} 0%, ${alpha(theme.palette.primary.dark, 0.06)} 40%, transparent 70%)`,
					filter: "blur(2px)",
					animation: `${haloPulse} 10s ease-in-out infinite`,
				}}
			/>
			<Box
				aria-hidden
				sx={{
					pointerEvents: "none",
					position: "absolute",
					bottom: { xs: "5%", md: "8%" },
					right: { xs: "-20%", md: "-5%" },
					width: 280,
					height: 280,
					borderRadius: "50%",
					background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.08)} 0%, transparent 65%)`,
				}}
			/>
			<Container
				maxWidth="lg"
				sx={{
					position: "relative",
					zIndex: 1,
					display: "flex",
					justifyContent: "center",
				}}
			>
				<Grid
					container
					spacing={gridSpacing}
					direction="column"
					sx={{ width: "100%", maxWidth: 920, alignItems: "center" }}
				>
					{children}
				</Grid>
			</Container>
		</Box>
	);
}
