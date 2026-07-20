"use client";

import { useState } from "react";
import { Check, Pill } from "lucide-react";
import styles from "./MedsTodayChecklist.module.css";

type Med = { id: string; name: string; dosage: string; takenToday: boolean };

export default function MedsTodayChecklist({
  familyId,
  meds: initialMeds,
}: {
  familyId: string;
  meds: Med[];
}) {
  const [meds, setMeds] = useState<Med[]>(initialMeds);
  const [busyId, setBusyId] = useState<string | null>(null);

  const taken = meds.filter((m) => m.takenToday).length;

  async function toggle(med: Med) {
    if (busyId) return;
    const next = !med.takenToday;
    setBusyId(med.id);
    setMeds((cur) => cur.map((m) => (m.id === med.id ? { ...m, takenToday: next } : m)));
    try {
      const res = await fetch(
        `/api/families/${familyId}/medications/${med.id}/dose`,
        { method: next ? "POST" : "DELETE" }
      );
      if (!res.ok) throw new Error("failed");
    } catch {
      // revert on failure
      setMeds((cur) =>
        cur.map((m) => (m.id === med.id ? { ...m, takenToday: !next } : m))
      );
    } finally {
      setBusyId(null);
    }
  }

  if (meds.length === 0) {
    return (
      <p className={styles.empty}>
        <Pill size={14} /> No daily medications tracked
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.summary}>
        <Pill size={14} /> Medications&nbsp;<strong>{taken} of {meds.length}</strong>&nbsp;taken today
      </p>
      <ul className={styles.list}>
        {meds.map((med) => (
          <li key={med.id}>
            <button
              type="button"
              className={styles.row}
              onClick={() => toggle(med)}
              disabled={busyId === med.id}
              aria-pressed={med.takenToday}
            >
              <span className={`${styles.check} ${med.takenToday ? styles.checked : ""}`}>
                {med.takenToday && <Check size={12} strokeWidth={3} />}
              </span>
              <span className={`${styles.name} ${med.takenToday ? styles.done : ""}`}>
                {med.name}
              </span>
              <span className={styles.dose}>{med.dosage}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
