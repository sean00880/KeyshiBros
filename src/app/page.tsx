import { HeroSection } from '@/components/hero/hero-section';
import { AboutSection } from '@/components/hero/about-section';
import { EcosystemOrbit } from '@/components/hero/ecosystem-orbit';
import { HowItWorks } from '@/components/hero/how-it-works';
import { RoadmapTimeline } from '@/components/hero/roadmap-timeline';
import { PresaleModule } from '@/components/presale/presale-module';
import { RewardsDashboard } from '@/components/dashboard/rewards-dashboard';
import { DiagonalTransition } from '@/components/ui/diagonal-transition';
import { ComingSoonGate } from '@/components/ui/coming-soon-gate';
import { AuthGate } from '@/components/dashboard/auth-gate';

function LandingContent() {
  return (
    <>
      {/* Dark: Hero */}
      <HeroSection />

      {/* Dark→White blend: About (background.gif) */}
      <AboutSection />

      {/* White: Ecosystem (scroll-locked) */}
      <EcosystemOrbit />

      {/* White: How It Works (revenue model) */}
      <HowItWorks />

      {/* White→Black diagonal: into Roadmap */}
      <RoadmapTimeline />

      {/* Black: Presale */}
      <PresaleModule />

      {/* Keyshi Bros characters between Presale and Command Center */}
      <div className="relative bg-kb-bg flex justify-center py-12 md:py-16">
        <img
          src="/assets/images/keyshibros2.png"
          alt="Keyshi Bros"
          className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain relative z-10"
        />
      </div>

      {/* Black→White diagonal: into Command Center */}
      <DiagonalTransition fromColor="#050508" toColor="#ffffff" flip />

      {/* White: Command Center — gated */}
      <ComingSoonGate>
        <RewardsDashboard />
      </ComingSoonGate>

      {/* White→Black diagonal: into Footer */}
      <DiagonalTransition fromColor="#ffffff" toColor="#050508" />
    </>
  );
}

export default function Page() {
  return (
    <main className="flex flex-col w-full">
      <AuthGate>
        <LandingContent />
      </AuthGate>
    </main>
  );
}
