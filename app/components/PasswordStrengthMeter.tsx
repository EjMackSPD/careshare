"use client";

import styles from "./PasswordStrengthMeter.module.css";

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
};

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "" };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Very short passwords stay weak even if they mix character types.
  if (password.length < 8) score = Math.min(score, 1);

  const clamped = Math.min(score, 4) as PasswordStrength["score"];
  const labels = ["Weak", "Weak", "Fair", "Good", "Strong"];

  return { score: clamped, label: labels[clamped] };
}

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label } = getPasswordStrength(password);

  return (
    <div className={styles.meter} aria-live="polite">
      <div className={styles.bars}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`${styles.bar} ${i < score ? styles[`bar${score}`] : ""}`}
          />
        ))}
      </div>
      <span className={`${styles.label} ${styles[`label${score}`]}`}>{label}</span>
    </div>
  );
}
