import { Paper, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { scaleFadeUp } from "../utils/homeMotion";

type HomeActionCardProps = {
	to: string;
	icon: ReactNode;
	title: string;
	description: string;
	staggerIndex?: number;
};

export default function HomeActionCard({
	to,
	icon,
	title,
	description,
	staggerIndex = 0,
}: HomeActionCardProps) {
	const theme = useTheme();
	const navigate = useNavigate();
	const delay = 0.28 + staggerIndex * 0.12;

	const sx = {
		p: 4,
		height: "100%",
		minHeight: 200,
		cursor: "pointer",
		display: "flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		gap: 2,
		backgroundColor: alpha(theme.palette.background.paper, 0.85),
		backdropFilter: "blur(10px)",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: alpha(theme.palette.primary.main, 0.12),
		borderRadius: 3,
		opacity: 0,
		animation: `${scaleFadeUp} 0.65s ${delay}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
		transition: theme.transitions.create(
			["border-color", "box-shadow", "transform", "background-color"],
			{ duration: theme.transitions.duration.shorter },
		),
		"&:hover": {
			borderColor: theme.palette.primary.main,
			boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
			transform: "translateY(-6px)",
			backgroundColor: alpha(theme.palette.background.paper, 0.95),
		},
		"&:active": {
			transform: "translateY(-2px)",
		},
	};

	return (
		<Paper
			elevation={2}
			onClick={() => navigate(to)}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					navigate(to);
				}
			}}
			role="button"
			tabIndex={0}
			sx={sx}
		>
			{icon}
			<Typography
				variant="h5"
				color="text.primary"
				fontWeight={600}
				textAlign="center"
			>
				{title}
			</Typography>
			<Typography variant="body2" color="text.secondary" textAlign="center">
				{description}
			</Typography>
		</Paper>
	);
}
