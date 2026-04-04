import HomeShell from "../components/HomeShell";
import HomeHero from "../components/HomeHero";
import HomeActionCards from "../components/HomeActionCards";
import PageScrollArea from "../components/PageScrollArea";

export default function HomePage() {
	return (
		<PageScrollArea>
			<HomeShell>
				<HomeHero />
				<HomeActionCards />
			</HomeShell>
		</PageScrollArea>
	);
}
