import { FeatureStrip } from "@/components/landing/feature-strip";
import { LandingHero } from "@/components/landing/hero";
import { InstallCta } from "@/components/landing/install-cta";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <LandingHero />
        <FeatureStrip />
        <InstallCta />
      </main>
      <SiteFooter />
    </div>
  );
}
