import { HeroSection } from "./hero";
import { ShowcaseSection } from "./showcase";

export default function IndexPage() {
    return (
        <main className="app-user-content app-workspace-scroll h-full overflow-y-auto text-foreground">
            <div className="mx-auto w-full max-w-[1440px]">
                <HeroSection />
                <ShowcaseSection />
            </div>
        </main>
    );
}
