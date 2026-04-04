import { keyframes } from "@mui/material/styles";

/** Entry: fade + rise (Tailwind-style “fade-up”). */
export const fadeUp = keyframes`
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
`;

/** Cards: slight scale for a softer landing. */
export const scaleFadeUp = keyframes`
	from {
		opacity: 0;
		transform: translateY(18px) scale(0.97);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
`;

/** Ambient halo behind hero. */
export const haloPulse = keyframes`
	0%,
	100% {
		opacity: 0.45;
		transform: translateX(-50%) scale(1);
	}
	50% {
		opacity: 0.7;
		transform: translateX(-50%) scale(1.06);
	}
`;
