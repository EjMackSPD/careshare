"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import styles from "../page.module.css";

export default function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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

        {/* Desktop Navigation */}
        <div className={styles.navLinks}>
          <Link href="/features">Features</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/partnerships">Partnerships</Link>
          <Link href="/login">Login</Link>
          <Link href="/login" className={styles.demoBtn}>
            🎮 Try Demo
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={styles.mobileMenuToggle}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/features" onClick={closeMobileMenu}>
              Features
            </Link>
            <Link href="/blog" onClick={closeMobileMenu}>
              Blog
            </Link>
            <Link href="/partnerships" onClick={closeMobileMenu}>
              Partnerships
            </Link>
            <Link href="/login" onClick={closeMobileMenu}>
              Login
            </Link>
            <Link
              href="/login"
              className={styles.mobileSignupBtn}
              onClick={closeMobileMenu}
            >
              🎮 Try Demo
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
