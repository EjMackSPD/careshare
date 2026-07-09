"use client";

import { useState } from "react";
import Link from "next/link";
import MarketingNav from "../../components/MarketingNav";
import Footer from "../../components/Footer";
import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/payload-api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 429) {
        const data = await response.json().catch(() => null);
        setError(
          data?.errors?.[0]?.message ||
            "Too many attempts. Please wait a bit before trying again."
        );
        setLoading(false);
        return;
      }

      // Otherwise always show the same success state, regardless of whether
      // the email is registered, so we don't leak which addresses have accounts.
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MarketingNav />
      <div className={styles.page}>
        <div className={styles.card}>
          {submitted ? (
            <>
              <span className={styles.eyebrow}>Check your email</span>
              <h1>Reset link on its way</h1>
              <p>
                If an account exists for <strong>{email}</strong>, we&apos;ve sent a
                password reset link. It expires in 1 hour.
              </p>
              <p className={styles.helpText}>
                Not sure which email you used?{" "}
                <Link href="/contact">Contact us</Link>{" "}
                and we&apos;ll help you find your account.
              </p>
              <div className={styles.actions}>
                <Link href="/login" className={styles.primaryAction}>
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className={styles.eyebrow}>Forgot password</span>
              <h1>Reset your password</h1>
              <p>
                Enter the email address on your account and we&apos;ll send you a
                link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className={styles.helpText}>
                Remembered it? <Link href="/login">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
