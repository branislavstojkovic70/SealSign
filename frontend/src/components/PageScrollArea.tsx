import { Box } from "@mui/material";
import type { ReactNode } from "react";

/**
 * Fills the navbar main region and scrolls when content (e.g. Issue form card) exceeds the viewport.
 */
export default function PageScrollArea({ children }: { children: ReactNode }) {
	return (
		<Box
			sx={{
				// flex-basis: 0 so height comes from the layout slot, not content — required for overflow scroll
				flex: "1 1 0%",
				width: "100%",
				minHeight: 0,
				overflowY: "auto",
				overflowX: "hidden",
				WebkitOverflowScrolling: "touch",
				overscrollBehavior: "contain",
			}}
		>
			{children}
		</Box>
	);
}
