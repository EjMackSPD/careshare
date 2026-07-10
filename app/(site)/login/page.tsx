"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Shield, Users, Sparkles } from "lucide-react";
import MarketingNav from "../../components/MarketingNav";
import Footer from "../../components/Footer";
import { payloadLogin } from "../../components/AuthProvider";
import EmailCodeForm from "../../components/EmailCodeForm";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  const getCallbackUrl = () =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl")
      : null;

  const handleSendMagic = async () => {
    if (!email || !email.includes("@")) {
      setError("Enter your email above first.");
      return;
    }
    setError("");
    setMagicLoading(true);
    try {
      await fetch("/api/auth/request-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackUrl: getCallbackUrl() }),
      });
      setMagicSent(true);
    } catch {
      setError("Could not send a sign-in code. Please try again.");
    } finally {
      setMagicLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await payloadLogin(email, password);

      if (!result.ok) {
        setError(result.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Carry any callbackUrl (set by middleware on the protected deep link)
      // through to post-login, which validates it before redirecting there.
      const callbackUrl = new URLSearchParams(window.location.search).get(
        "callbackUrl"
      );
      router.push(
        callbackUrl
          ? `/auth/post-login?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : "/auth/post-login"
      );
      router.refresh();
    } catch (error) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <>
      <MarketingNav />
      <div className={styles.container}>
        {/* Left Panel - Hero Content */}
        <div className={styles.leftPanel}>
          <div className={styles.heroContent}>
            <h1>Welcome back to CareShare</h1>
            <p className={styles.subtitle}>
              Sign in to continue your caregiver, family, care center, or
              personal support workflow.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Heart size={24} />
                </div>
                <div>
                  <h3>Your Family Hub</h3>
                  <p>
                    Keep care updates, tasks, and planning in one trusted place
                  </p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Shield size={24} />
                </div>
                <div>
                  <h3>Secure Access</h3>
                  <p>Your data is protected with enterprise-grade security</p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Users size={24} />
                </div>
                <div>
                  <h3>Stay Connected</h3>
                  <p>Bring family members, supporters, or staff into the loop</p>
                </div>
              </div>

              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3>AI Care Concierge</h3>
                  <p>Get grounded answers about your family&apos;s care situation</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2>Sign in to your account</h2>
              <p>Enter your credentials to access your dashboard</p>
            </div>

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

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {magicSent ? (
              <div style={{ marginTop: "1.25rem" }}>
                <EmailCodeForm
                  email={email}
                  callbackUrl={getCallbackUrl()}
                  onVerified={(redirectTo) => {
                    window.location.href = redirectTo;
                  }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSendMagic}
                disabled={magicLoading}
                className={styles.magicBtn}
              >
                {magicLoading ? "Sending…" : "Email me a sign-in link or code"}
              </button>
            )}

            <div className={styles.formFooter}>
              <p>
                Don&apos;t have an account? <Link href="/onboarding">Sign up</Link>
              </p>
              <p className={styles.adminLink}>
                <Link href="/admin">Care Provider Login →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
