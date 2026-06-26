import { PersonalDashboard } from "@/components/finance/personal-dashboard";
import { ProfileDashboard } from "@/components/finance/profile-dashboard";
import { parsePersonalDashboardPeriod } from "@/lib/data/personal-dashboard";
import { parseProfile } from "@/lib/ui/preferences";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const profile = parseProfile(params.profile);

  if (profile === "business") {
    return <ProfileDashboard profile="business" />;
  }

  return <PersonalDashboard period={parsePersonalDashboardPeriod(params.period)} />;
}
