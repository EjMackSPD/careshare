"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ListChecks,
  Mail,
  MessageSquare,
  NotebookPen,
  Users,
} from "lucide-react";
import styles from "./page.module.css";

type MemberInteraction = {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  lastLoginAt: string | null;
  noteCount: number;
  messageCount: number;
  assignedTaskCount: number;
  lastAction: { action: string; createdAt: string } | null;
};

type EngagementStatus = "active" | "quiet" | "never";

const ACTIVE_WINDOW_DAYS = 7;

function daysSince(value: string | null) {
  if (!value) return null;
  return Math.floor((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
}

function getEngagementStatus(lastLoginAt: string | null): EngagementStatus {
  const days = daysSince(lastLoginAt);
  if (days === null) return "never";
  if (days <= ACTIVE_WINDOW_DAYS) return "active";
  return "quiet";
}

function formatRelative(value: string | null) {
  if (!value) return "Never logged in";
  const date = new Date(value);
  const diffMins = Math.round((Date.now() - date.getTime()) / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAction(action: string) {
  return action.replace(/[._]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function roleLabel(role: string) {
  return role.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function FamilyInteractionsPage() {
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberInteraction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const familiesRes = await fetch("/api/families");
        if (!familiesRes.ok) throw new Error("Failed to load families");
        const families = await familiesRes.json();
        const familiesArray = Array.isArray(families) ? families : [];

        if (familiesArray.length === 0) {
          setError("Join or create a family to see member interactions.");
          setLoading(false);
          return;
        }

        const family = familiesArray[0];
        setFamilyName(family.name ?? null);

        const res = await fetch(`/api/families/${family.id}/interactions`);
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(
            data?.error || "You do not have permission to view member interactions."
          );
        }
        const data = await res.json();
        setMembers(data.members ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const summary = useMemo(() => {
    if (!members) return null;

    const activeThisWeek = members.filter(
      (member) => getEngagementStatus(member.lastLoginAt) === "active"
    ).length;
    const needsNudge = members.filter((member) => {
      const status = getEngagementStatus(member.lastLoginAt);
      return status === "never" || status === "quiet";
    }).length;
    const totalActivity = members.reduce(
      (sum, member) => sum + member.noteCount + member.messageCount + member.assignedTaskCount,
      0
    );

    return {
      totalMembers: members.length,
      activeThisWeek,
      needsNudge,
      totalActivity,
    };
  }, [members]);

  const maxActivity = useMemo(() => {
    if (!members) return 0;
    return Math.max(
      1,
      ...members.map((m) => m.noteCount + m.messageCount + m.assignedTaskCount)
    );
  }, [members]);

  return (
    <div className={styles.container}>
      <div className={styles.layout}>
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <p className={styles.eyebrow}>Family Admin</p>
              <h1>Family Interactions</h1>
              <p className={styles.subtitle}>
                {familyName
                  ? `A quick summary sheet of how each member of ${familyName} is engaging — logins, notes, messages, and tasks.`
                  : "A quick summary sheet of how each family member is engaging — logins, notes, messages, and tasks."}
              </p>
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading engagement summary…</p>
            </div>
          ) : error ? (
            <div className={styles.errorState}>
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          ) : (
            <>
              {summary && (
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <Users size={18} />
                    </div>
                    <div>
                      <h3>{summary.totalMembers}</h3>
                      <p>Total members</p>
                    </div>
                  </div>
                  <div className={`${styles.summaryCard} ${styles.summaryGood}`}>
                    <div className={styles.summaryIcon}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h3>{summary.activeThisWeek}</h3>
                      <p>Active in last 7 days</p>
                    </div>
                  </div>
                  <div className={styles.summaryCard}>
                    <div className={styles.summaryIcon}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <h3>{summary.totalActivity}</h3>
                      <p>Notes, messages &amp; tasks combined</p>
                    </div>
                  </div>
                  <div
                    className={`${styles.summaryCard} ${
                      summary.needsNudge > 0 ? styles.summaryWarn : ""
                    }`}
                  >
                    <div className={styles.summaryIcon}>
                      <Clock size={18} />
                    </div>
                    <div>
                      <h3>{summary.needsNudge}</h3>
                      <p>Could use a nudge</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.tableCard}>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Status</th>
                        <th>Last login</th>
                        <th>Joined</th>
                        <th>
                          <NotebookPen size={13} /> Notes
                        </th>
                        <th>
                          <MessageSquare size={13} /> Messages
                        </th>
                        <th>
                          <ListChecks size={13} /> Tasks
                        </th>
                        <th>Engagement</th>
                        <th>Last activity</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {members?.map((member) => {
                        const status = getEngagementStatus(member.lastLoginAt);
                        const activityScore =
                          member.noteCount + member.messageCount + member.assignedTaskCount;
                        const engagementPercent = Math.round(
                          (activityScore / maxActivity) * 100
                        );

                        return (
                          <tr key={member.userId}>
                            <td>
                              <div className={styles.memberCell}>
                                <div className={styles.avatar}>
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong>{member.name}</strong>
                                  <span>{member.email}</span>
                                  <span className={styles.roleTag}>{roleLabel(member.role)}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`${styles.statusBadge} ${styles[`status_${status}`]}`}
                              >
                                {status === "active"
                                  ? "Active"
                                  : status === "quiet"
                                  ? "Quiet"
                                  : "Never logged in"}
                              </span>
                            </td>
                            <td>{formatRelative(member.lastLoginAt)}</td>
                            <td>
                              {new Date(member.joinedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>
                            <td>{member.noteCount}</td>
                            <td>{member.messageCount}</td>
                            <td>{member.assignedTaskCount}</td>
                            <td>
                              <div className={styles.engagementBar}>
                                <div
                                  className={styles.engagementFill}
                                  style={{ width: `${engagementPercent}%` }}
                                />
                              </div>
                            </td>
                            <td>
                              {member.lastAction ? (
                                <span className={styles.lastAction}>
                                  {formatAction(member.lastAction.action)}
                                  <span className={styles.lastActionTime}>
                                    {formatRelative(member.lastAction.createdAt)}
                                  </span>
                                </span>
                              ) : (
                                <span className={styles.noActivity}>No recorded activity</span>
                              )}
                            </td>
                            <td>
                              {status !== "active" && (
                                <a
                                  href={`mailto:${member.email}?subject=${encodeURIComponent(
                                    "Checking in on CareShare"
                                  )}`}
                                  className={styles.nudgeBtn}
                                >
                                  <Mail size={13} />
                                  Nudge
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className={styles.footnote}>
                Note: activity tracking currently covers logins, notes, messages, task
                assignments, and admin actions (invites, role changes, etc.). Day-to-day edits
                to tasks, costs, and events are not yet individually logged.
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
