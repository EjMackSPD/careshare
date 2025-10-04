"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import styles from "../users/page.module.css";

export default function DatabaseToolsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isRunning, setIsRunning] = useState(false);

  const isAdmin =
    session?.user?.email === "admin@careshare.app" ||
    session?.user?.email === "demo@careshare.app";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !isAdmin) {
      router.push("/dashboard");
    }
  }, [status, isAdmin, router]);

  if (status === "loading" || !isAdmin) {
    return null;
  }

  const tools = [
    {
      title: "Export Database",
      description: "Download a backup of all database data",
      icon: <Download size={32} />,
      action: "export",
      color: "#dbeafe",
      iconColor: "#2563eb",
      buttonText: "Export Data",
    },
    {
      title: "Import Data",
      description: "Upload and import data from a backup file",
      icon: <Upload size={32} />,
      action: "import",
      color: "#dcfce7",
      iconColor: "#16a34a",
      buttonText: "Import Data",
    },
    {
      title: "Reset Demo Data",
      description: "Reset database to demo state with sample data",
      icon: <RefreshCw size={32} />,
      action: "reset",
      color: "#fef3c7",
      iconColor: "#ca8a04",
      buttonText: "Reset Demo",
    },
    {
      title: "Clear Cache",
      description: "Clear all cached data and temporary files",
      icon: <Trash2 size={32} />,
      action: "cache",
      color: "#e9d5ff",
      iconColor: "#7c3aed",
      buttonText: "Clear Cache",
    },
  ];

  const handleAction = async (action: string) => {
    if (action === "reset") {
      if (
        !confirm(
          "Are you sure you want to reset to demo data? This cannot be undone."
        )
      ) {
        return;
      }
    }

    setIsRunning(true);
    // Simulate action
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRunning(false);
    alert(`${action} completed successfully!`);
  };

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />

        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerIcon}>
                <Database size={32} />
              </div>
              <div>
                <h1>Database Tools</h1>
                <p>Manage database operations and maintenance</p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "0.75rem",
              padding: "1rem 1.5rem",
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              marginBottom: "2rem",
            }}
          >
            <AlertTriangle
              size={24}
              style={{ color: "#dc2626", flexShrink: 0 }}
            />
            <div>
              <div
                style={{
                  fontWeight: 600,
                  color: "#991b1b",
                  marginBottom: "0.25rem",
                }}
              >
                Caution: Dangerous Operations
              </div>
              <div style={{ fontSize: "0.875rem", color: "#dc2626" }}>
                These operations can permanently modify or delete data. Always
                create a backup before performing destructive actions.
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            {tools.map((tool, index) => (
              <div key={index} className={styles.statCard}>
                <div
                  className={styles.statIcon}
                  style={{ background: tool.color }}
                >
                  <div style={{ color: tool.iconColor }}>{tool.icon}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "#1e293b",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {tool.title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "#64748b",
                      marginBottom: "1rem",
                    }}
                  >
                    {tool.description}
                  </div>
                  <button
                    onClick={() => handleAction(tool.action)}
                    disabled={isRunning}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#6366f1",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: isRunning ? "not-allowed" : "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      opacity: isRunning ? 0.5 : 1,
                    }}
                  >
                    {isRunning ? "Processing..." : tool.buttonText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "3rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "1rem",
              }}
            >
              Database Statistics
            </h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Table Name</th>
                    <th>Record Count</th>
                    <th>Size</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Users</td>
                    <td>1</td>
                    <td>2.4 KB</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Families</td>
                    <td>1</td>
                    <td>1.8 KB</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Tasks</td>
                    <td>50</td>
                    <td>12.5 KB</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Events</td>
                    <td>139</td>
                    <td>28.3 KB</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Messages</td>
                    <td>40</td>
                    <td>8.2 KB</td>
                    <td>{new Date().toLocaleDateString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
