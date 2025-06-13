import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingStats } from "@/components/landing/stats";
import { LandingNavigation } from "@/components/landing/navigation";
import { SessionGuard } from "@/components/guards/session-guard";

export default function LandingPage() {
  return (
    <SessionGuard redirectTo="/dashboard" whenAuthenticated>
      <div className="min-h-screen bg-gradient-to-br from-ku-green via-green-600 to-ku-green-dark">
        <LandingNavigation />
        <LandingHero />
        <LandingFeatures />
        <LandingStats />
      </div>
    </SessionGuard>
  );
}
