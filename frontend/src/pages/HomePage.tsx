import HomeShell from "../components/HomeShell";
import HomeHero from "../components/HomeHero";
import HomeActionCards from "../components/HomeActionCards";

export default function HomePage() {
	return (
		<HomeShell>
			<HomeHero />
			<HomeActionCards />
		</HomeShell>
	);
}
