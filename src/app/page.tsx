import { LandingNav } from '@/components/marketing/landing-nav';
import { LandingHero } from '@/components/marketing/landing-hero';
import { LandingBenefits } from '@/components/marketing/landing-benefits';
import { LandingCta } from '@/components/marketing/landing-cta';
import { LandingFooter } from '@/components/marketing/landing-footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
      <LandingNav />
      <main>
        <LandingHero />
        <LandingBenefits />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
