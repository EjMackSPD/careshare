"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Shield, Users, Sparkles } from "lucide-react";
import MarketingNav from "../../components/MarketingNav";
import Footer from "../../components/Footer";
import { payloadLogin } from "../../components/AuthProvider";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await payloadLogin(email, password);

      if (!result.ok) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/auth/post-login");
      router.refresh();
    } catch (error) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    setError("");

    try {
      // First, ensure demo user and data exist
      const setupResponse = await fetch("/api/auth/demo", {
        method: "POST",
      });

      if (!setupResponse.ok) {
        setError("Failed to set up demo mode");
        setLoading(false);
        return;
      }

      // Now sign in with demo account
      const result = await payloadLogin("demo@careshare.app", "demo123");

      if (!result.ok) {
        setError("Demo mode login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Demo users always skip onboarding (already have data)
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("Something went wrong with demo mode");
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
                  <h3>Try Demo Mode</h3>
                  <p>
                    Explore with pre-loaded examples and see what&apos;s
                    possible
                  </p>
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
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className={styles.divider}>
              <span>New to CareShare?</span>
            </div>

            <div className={styles.demoOptions}>
              <button
                type="button"
                onClick={handleDemoMode}
                disabled={loading}
                className={styles.demoBtn}
              >
                Quick Demo
              </button>
            </div>
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
