"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MarketingNav from "../../components/MarketingNav";
import Footer from "../../components/Footer";
import PasswordStrengthMeter from "../../components/PasswordStrengthMeter";
import styles from "./page.module.css";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (!token) {
      setError("This reset link is missing its token. Please request a new one.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/payload-api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.errors?.[0]?.message || "This reset link is invalid or has expired.");
      }

      router.push("/auth/post-login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.card}>
        <span className={styles.eyebrow}>Invalid link</span>
        <h1>This reset link is missing a token</h1>
        <p>Please request a new password reset link.</p>
        <div className={styles.actions}>
          <Link href="/forgot-password" className={styles.primaryAction}>
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <span className={styles.eyebrow}>Reset password</span>
      <h1>Choose a new password</h1>
      <p>Enter a new password for your CareShare account.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.formGroup}>
          <label htmlFor="password">New password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
          />
          <PasswordStrengthMeter password={password} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            placeholder="••••••••"
          />
        </div>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <MarketingNav />
      <div className={styles.page}>
        <Suspense fallback={null}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <Footer />
    </>
  );
}
