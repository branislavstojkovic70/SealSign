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

/** Live audit feed dot (Archive). */
export const liveDotPulse = keyframes`
	0%,
	100% {
		opacity: 1;
		transform: scale(1);
		box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55);
	}
	50% {
		opacity: 0.85;
		transform: scale(1.08);
		box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
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
