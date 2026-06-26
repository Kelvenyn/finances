export type NavIconName =
  | "dashboard"
  | "transactions"
  | "cards"
  | "settings"
  | "logout"
  | "menu"
  | "chevron";

export function NavIcon({ name }: { name: NavIconName }) {
  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 13h7V4H4v9Z" />
        <path d="M13 20h7V4h-7v16Z" />
        <path d="M4 20h7v-5H4v5Z" />
      </svg>
    );
  }

  if (name === "transactions") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 7h13" />
        <path d="M7 12h13" />
        <path d="M7 17h13" />
        <path d="M4 7h.01" />
        <path d="M4 12h.01" />
        <path d="M4 17h.01" />
      </svg>
    );
  }

  if (name === "cards") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h16v10H4z" />
        <path d="M4 10.5h16" />
        <path d="M8 15h3" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
        <path d="M4 12h2" />
        <path d="M18 12h2" />
        <path d="M12 4v2" />
        <path d="M12 18v2" />
        <path d="m6.7 6.7 1.4 1.4" />
        <path d="m15.9 15.9 1.4 1.4" />
        <path d="m17.3 6.7-1.4 1.4" />
        <path d="m8.1 15.9-1.4 1.4" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 6H6v12h4" />
        <path d="M13 12h7" />
        <path d="m17 8 4 4-4 4" />
      </svg>
    );
  }

  if (name === "menu") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 7h14" />
        <path d="M5 12h14" />
        <path d="M5 17h14" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
