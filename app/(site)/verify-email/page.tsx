"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MarketingNav from "@/app/components/MarketingNav";
import Footer from "@/app/components/Footer";
import EmailCodeForm from "@/app/components/EmailCodeForm";
import { payloadLogout, useSession } from "@/app/components/AuthProvider";
import styles from "../login/page.module.css";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ready, setReady] = useState(false);
  const sentRef = useRef(false);

  const email = session?.user?.email ?? "";

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.replace("/login");
      return;
    }
    if (session.user.emailVerified) {
      router.replace("/dashboard");
      return;
    }

    // Send a fresh code once when the gate loads (e.g. password login while unverified).
    if (!sentRef.current) {
      sentRef.current = true;
      void fetch("/api/auth/request-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
    }
    setReady(true);
  }, [session, status, router]);

  const handleSignOut = async () => {
    await payloadLogout();
    router.replace("/login");
  };

  return (
    <>
      <MarketingNav />
      <main className={styles.container}>
        <section className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h1>Verify your email</h1>
              <p>Confirm your email address to finish accessing CareShare.</p>
            </div>

            {ready && email ? (
              <EmailCodeForm
                email={email}
                onVerified={(redirectTo) => {
                  window.location.href = redirectTo;
                }}
              />
            ) : (
              <p>Loading…</p>
            )}

            <div className={styles.formFooter}>
              <p>
                Wrong account?{" "}
                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--cs-color-brand)",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Sign out
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
