"use client";

import { useEffect } from "react";
import Link from "next/link";
import MarketingNav from "@/app/components/MarketingNav";
import Footer from "@/app/components/Footer";
import { payloadLogout } from "@/app/components/AuthProvider";
import styles from "@/app/login/page.module.css";

export default function ResetPasswordRequiredPage() {
  useEffect(() => {
    void payloadLogout();
  }, []);

  return (
    <>
      <MarketingNav />
      <main className={styles.container}>
        <section className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h1>Password reset required</h1>
              <p>
                Your account was migrated into Payload CMS. For security, reset your
                password before continuing.
              </p>
            </div>
            <Link href="/admin/forgot" className={styles.submitBtn}>
              Reset password
            </Link>
            <div className={styles.formFooter}>
              <p>
                Already reset it? <Link href="/login">Return to login</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
