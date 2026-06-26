"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { parseProfile, profileMeta } from "@/lib/ui/preferences";
import type { ProfileType } from "@/lib/types";

const profiles: ProfileType[] = ["personal", "business"];

export function ProfileSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeProfile = parseProfile(searchParams.get("profile"));
  const activeMeta = profileMeta(activeProfile);

  return (
    <section className="profile-switcher" aria-label="Perfil financeiro ativo">
      <div className="profile-current">
        <span className="profile-avatar">{activeMeta.iconLabel}</span>
        <span>
          <strong>{activeMeta.label}</strong>
          <small>{activeMeta.subtitle}</small>
        </span>
      </div>

      <div className="profile-segments">
        {profiles.map((profile) => {
          const meta = profileMeta(profile);
          return (
            <Link
              key={profile}
              href={profileHref(pathname, searchParams, profile)}
              className={profile === activeProfile ? "active" : ""}
            >
              {meta.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function activeProfileFromParams(params: Record<string, string | undefined>) {
  return parseProfile(params.profile);
}

function profileHref(
  pathname: string,
  searchParams: { toString: () => string },
  profile: ProfileType,
) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.set("profile", profile);
  return `${pathname}?${nextParams.toString()}`;
}
