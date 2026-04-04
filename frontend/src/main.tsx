import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "./utils/reown";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Box, CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import Navbar from "./components/navbar";
import HomePage from "./pages/HomePage";
import IssuePage from "./pages/IssuePage";
import VerifyPage from "./pages/VerifyPage";
import ArchivePage from "./pages/ArchivePage";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Navbar />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "issue", element: <IssuePage /> },
			{ path: "verify", element: <VerifyPage /> },
			{ path: "archive", element: <ArchivePage /> },
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<ThemeProvider theme={theme}>
			<CssBaseline />
			<Box
				sx={{
					flex: "1 1 0%",
					minHeight: 0,
					display: "flex",
					flexDirection: "column",
					height: "100%",
					overflow: "hidden",
				}}
			>
				<RouterProvider router={router} />
			</Box>
			<Toaster
				position="bottom-center"
				toastOptions={{
					success: {
						style: {
							background: theme.palette.success.main,
						},
					},
					error: {
						style: {
							background: theme.palette.error.main,
							color: "#F5F5F5",
						},
					},
				}}
			/>
	</ThemeProvider>
);