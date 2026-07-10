"use client";

import { useState } from "react";
import styles from "./EmailCodeForm.module.css";

type Props = {
  email: string;
  callbackUrl?: string | null;
  // Called after a successful verification. Receives the server's redirect target.
  onVerified: (redirectTo: string) => void;
};

export default function EmailCodeForm({ email, callbackUrl, onVerified }: Props) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">(
    "idle"
  );

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: code.trim(), callbackUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "That code didn't work. Please try again.");
        setSubmitting(false);
        return;
      }
      onVerified(data.redirectTo || "/auth/post-login");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendState("sending");
    setError("");
    try {
      await fetch("/api/auth/request-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, callbackUrl }),
      });
      setResendState("sent");
    } catch {
      setResendState("idle");
    }
  };

  return (
    <form onSubmit={handleVerify} className={styles.form}>
      <p className={styles.hint}>
        Enter the 6-digit code we emailed to <strong>{email}</strong>, or click the
        link in that email.
      </p>
      {error && <div className={styles.error}>{error}</div>}
      <input
        className={styles.codeInput}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        autoFocus
      />
      <button
        type="submit"
        className={styles.submitBtn}
        disabled={submitting || code.length !== 6}
      >
        {submitting ? "Verifying…" : "Verify"}
      </button>
      <button
        type="button"
        className={styles.resendBtn}
        onClick={handleResend}
        disabled={resendState === "sending"}
      >
        {resendState === "sent"
          ? "Code re-sent ✓"
          : resendState === "sending"
            ? "Sending…"
            : "Resend code"}
      </button>
    </form>
  );
}
