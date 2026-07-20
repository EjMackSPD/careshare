"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, Wallet, Users } from "lucide-react";
import styles from "./BottomTabBar.module.css";

// The custom Care Concierge mark: cupped hands cradling a star.
function HandsStarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.6c.45 2.75 1.4 4.15 4.15 4.6-2.75.45-3.7 1.85-4.15 4.6-.45-2.75-1.4-4.15-4.15-4.6 2.75-.45 3.7-1.85 4.15-4.6z" />
      <path d="M4.3 12.6c-.5 4.4 2.9 7.9 7.7 7.9s8.2-3.5 7.7-7.9c-.55 1.5-1.5 2.75-2.65 3.55.35-.95.05-2.15-.85-2.25-.75-.08-1.25.55-1.35 1.35-.1-.95-.6-1.7-1.55-1.7s-1.45.75-1.55 1.7c-.1-.8-.6-1.43-1.35-1.35-.9.1-1.2 1.3-.85 2.25C5.8 15.35 4.85 14.1 4.3 12.6z" />
    </svg>
  );
}

type Tab = {
  href: string;
  label: string;
  icon?: typeof Home;
  center?: boolean;
};

const tabs: Tab[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/care-concierge", label: "Ask", center: true },
  { href: "/dashboard/finances", label: "Costs", icon: Wallet },
  { href: "/family", label: "Family", icon: Users },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const visible =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/family") ||
    pathname === "/care";
  if (!visible) return null;

  return (
    <nav className={styles.tabBar} aria-label="Primary">
      {tabs.map(({ href, label, icon: Icon, center }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname?.startsWith(href);

        if (center) {
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.tab} ${styles.centerTab} ${isActive ? styles.centerActive : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={styles.centerFab}>
                <HandsStarIcon />
              </span>
              <span>{label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {Icon && <Icon size={22} />}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
