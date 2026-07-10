"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Wallet,
  Sparkles,
} from "lucide-react";
import styles from "./BottomTabBar.module.css";

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/finances", label: "Finances", icon: Wallet },
  { href: "/dashboard/care-concierge", label: "Concierge", icon: Sparkles },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  if (!pathname?.startsWith("/dashboard") && pathname !== "/care") {
    return null;
  }

  return (
    <nav className={styles.tabBar} aria-label="Primary">
      {tabs.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
