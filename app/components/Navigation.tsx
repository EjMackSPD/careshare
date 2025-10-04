"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import ResetDemoButton from "./ResetDemoButton";
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
  banner,
}: NavigationProps) {
  const { data: session } = useSession();

  // Auto-detect demo mode if no banner prop provided
  const isDemoMode = session?.user?.email === "demo@careshare.app";
  // Only show demo banner on authenticated pages
  const shouldShowBanner = banner || (isDemoMode && showAuthLinks);

  return (
    <div className={styles.navigationWrapper}>
      {/* Alert/Demo Banner */}
      {shouldShowBanner && (
        <div className={`${styles.banner} ${styles[banner?.type || "demo"]}`}>
          <div className={styles.bannerContent}>
            <div className={styles.bannerMessage}>
              {banner?.message || (
                <>
                  <strong>🎮 Demo Mode Active</strong>
                  <span>
                    You're exploring with sample data. Feel free to experiment!
                  </span>
                </>
              )}
            </div>
            {(banner?.showReset || isDemoMode) && <ResetDemoButton />}
          </div>
        </div>
      )}

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
              <Link href="/api/auth/signout">Sign out</Link>
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
