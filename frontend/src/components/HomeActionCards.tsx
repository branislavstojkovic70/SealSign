import { Grid, useTheme } from "@mui/material";
import { UploadFile, ManageSearch } from "@mui/icons-material";
import HomeActionCard from "./HomeActionCard";

export default function HomeActionCards() {
	const theme = useTheme();

	return (
		<Grid
			container
			spacing={3}
			size={{ xs: 12 }}
			sx={{ width: "100%", justifyContent: "center" }}
		>
			<Grid size={{ xs: 12, sm: 10, md: 5 }}>
				<HomeActionCard
					staggerIndex={0}
					to="/issue"
					title="Issue"
					description="Push a hash to the registry permanent."
					icon={
						<UploadFile
							sx={{
								fontSize: 48,
								color: theme.palette.primary.main,
							}}
							aria-hidden
						/>
					}
				/>
			</Grid>
			<Grid size={{ xs: 12, sm: 10, md: 5 }}>
				<HomeActionCard
					staggerIndex={1}
					to="/verify"
					title="Verify"
					description="Drop a file and see the outcome."
					icon={
						<ManageSearch
							sx={{
								fontSize: 48,
								color: theme.palette.primary.main,
							}}
							aria-hidden
						/>
					}
				/>
			</Grid>
		</Grid>
	);
}
