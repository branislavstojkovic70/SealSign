import { Box, Typography, useTheme } from "@mui/material";

type PlaceholderPageProps = { title: string };

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
	const theme = useTheme();
	return (
		<Box
			component="main"
			sx={{
				flex: 1,
				p: 3,
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				textAlign: "center",
				backgroundColor: theme.palette.background.default,
			}}
		>
			<Typography variant="h4" color="text.primary">
				{title}
			</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
				Coming soon.
			</Typography>
		</Box>
	);
}
