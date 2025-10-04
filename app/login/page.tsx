"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Shield, Users, Sparkles } from "lucide-react";
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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
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
      const result = await signIn("credentials", {
        email: "demo@careshare.app",
        password: "demo123",
        redirect: false,
      });

      if (result?.error) {
        setError("Demo mode login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Successfully logged in as demo user
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError("Something went wrong with demo mode");
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Panel - Hero Content */}
      <div className={styles.leftPanel}>
        <Link href="/" className={styles.logoLink}>
          <Image
            src="/careshare-logo.png"
            alt="CareShare Logo"
            width={200}
            height={75}
            priority
          />
        </Link>

        <div className={styles.heroContent}>
          <h1>Welcome back to CareShare</h1>
          <p className={styles.subtitle}>
            Continue coordinating care with your family. Sign in to access your
            dashboard.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Heart size={24} />
              </div>
              <div>
                <h3>Your Family Hub</h3>
                <p>
                  Access all your family&apos;s caregiving information in one
                  place
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
                <p>Keep everyone in your family informed and involved</p>
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Sparkles size={24} />
              </div>
              <div>
                <h3>Try Demo Mode</h3>
                <p>
                  Explore with pre-loaded examples and see what&apos;s possible
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
            <span>OR</span>
          </div>

          <button
            onClick={handleDemoMode}
            className={styles.demoBtn}
            type="button"
            disabled={loading}
          >
            <Sparkles size={20} />
            {loading ? "Setting up demo..." : "Try Demo Mode"}
          </button>
          <p className={styles.demoText}>
            Explore CareShare with pre-populated demo data
          </p>

          <div className={styles.formFooter}>
            <p>
              Don&apos;t have an account? <Link href="/signup">Sign up</Link>
            </p>
            <p className={styles.adminLink}>
              <Link href="/admin/login">Care Provider Login →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
