"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navigation.module.css";

type NavigationProps = {
  showAuthLinks?: boolean;
  backLink?: {
    href: string;
    label: string;
  };
  banner?: {
    type: "demo" | "alert" | "info" | "success" | "warning";
    message: string;
    showReset?: boolean;
  };
};

export default function Navigation({
  showAuthLinks = false,
  backLink,
}: NavigationProps) {
  const { data: session } = useSession();

  return (
    <div className={styles.navigationWrapper}>
      {/* Main Navigation */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/careshare-logo.png"
            alt="CareShare Logo"
            width={180}
            height={68}
            priority
          />
        </Link>

        <div className={styles.navRight}>
          {backLink && (
            <Link href={backLink.href} className={styles.backLink}>
              ← {backLink.label}
            </Link>
          )}

          {showAuthLinks ? (
            <div className={styles.navLinks}>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/family">My Families</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/profile">My Profile</Link>
              <Link href="/signout">Sign out</Link>
            </div>
          ) : (
            !backLink && (
              <div className={styles.navLinks}>
                <Link href="/blog">Blog</Link>
                <Link href="/login">Demo</Link>
                <Link href="/signup">Sign Up</Link>
              </div>
            )
          )}
        </div>
      </nav>
    </div>
  );
}
