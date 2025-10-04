"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "../page.module.css";

export default function MarketingNav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.navContainer}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/careshare-logo.png"
            alt="CareShare Logo"
            width={200}
            height={75}
            priority
          />
        </Link>
        <div className={styles.navLinks}>
          <Link href="/features">Features</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/partnerships">Partnerships</Link>
          <Link href="/login">Login</Link>
          <Link href="/signup" className={styles.signupBtn}>
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
}
