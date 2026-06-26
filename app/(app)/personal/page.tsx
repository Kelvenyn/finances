import { PersonalDashboard } from "@/components/finance/personal-dashboard";
import { parsePersonalDashboardPeriod } from "@/lib/data/personal-dashboard";

export const dynamic = "force-dynamic";

export default async function PersonalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  return <PersonalDashboard period={parsePersonalDashboardPeriod(params.period)} />;
}
