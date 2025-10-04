"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  Settings,
  Mail,
  Bell,
  Shield,
  Database,
  Globe,
  DollarSign,
  Zap,
} from "lucide-react";
import styles from "./page.module.css";

export default function SystemSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState({
    siteName: "CareShare",
    siteDescription: "Family Care Coordination Platform",
    emailNotifications: true,
    pushNotifications: true,
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
    sessionTimeout: "30",
    maxUploadSize: "10",
    stripeEnabled: false,
    stripePublicKey: "",
    stripeSecretKey: "",
  });

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

  const handleSave = () => {
    alert("Settings saved successfully!");
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
                <Settings size={32} />
              </div>
              <div>
                <h1>System Settings</h1>
                <p>Configure platform settings and preferences</p>
              </div>
            </div>
          </div>

          <div className={styles.settingsGrid}>
            {/* General Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <Globe size={24} />
                <h2>General Settings</h2>
              </div>
              <div className={styles.settingRow}>
                <label>Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings({ ...settings, siteName: e.target.value })
                  }
                  className={styles.input}
                />
              </div>
              <div className={styles.settingRow}>
                <label>Site Description</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      siteDescription: e.target.value,
                    })
                  }
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </div>

            {/* Notification Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <Bell size={24} />
                <h2>Notifications</h2>
              </div>
              <div className={styles.settingRow}>
                <label>Email Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className={styles.checkbox}
                />
              </div>
              <div className={styles.settingRow}>
                <label>Push Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pushNotifications: e.target.checked,
                    })
                  }
                  className={styles.checkbox}
                />
              </div>
            </div>

            {/* Security Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <Shield size={24} />
                <h2>Security</h2>
              </div>
              <div className={styles.settingRow}>
                <label>Allow New Registrations</label>
                <input
                  type="checkbox"
                  checked={settings.allowRegistrations}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowRegistrations: e.target.checked,
                    })
                  }
                  className={styles.checkbox}
                />
              </div>
              <div className={styles.settingRow}>
                <label>Require Email Verification</label>
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      requireEmailVerification: e.target.checked,
                    })
                  }
                  className={styles.checkbox}
                />
              </div>
              <div className={styles.settingRow}>
                <label>Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    setSettings({ ...settings, sessionTimeout: e.target.value })
                  }
                  className={styles.input}
                />
              </div>
            </div>

            {/* System Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <Database size={24} />
                <h2>System</h2>
              </div>
              <div className={styles.settingRow}>
                <label>Maintenance Mode</label>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      maintenanceMode: e.target.checked,
                    })
                  }
                  className={styles.checkbox}
                />
              </div>
              <div className={styles.settingRow}>
                <label>Max Upload Size (MB)</label>
                <input
                  type="number"
                  value={settings.maxUploadSize}
                  onChange={(e) =>
                    setSettings({ ...settings, maxUploadSize: e.target.value })
                  }
                  className={styles.input}
                />
              </div>
            </div>

            {/* Payment Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <DollarSign size={24} />
                <h2>Payment Settings</h2>
              </div>
              <div className={styles.settingRow}>
                <label>Enable Stripe Payments</label>
                <input
                  type="checkbox"
                  checked={settings.stripeEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      stripeEnabled: e.target.checked,
                    })
                  }
                  className={styles.checkbox}
                />
              </div>
              {settings.stripeEnabled && (
                <>
                  <div className={styles.settingRow}>
                    <label>Stripe Public Key</label>
                    <input
                      type="text"
                      value={settings.stripePublicKey}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          stripePublicKey: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder="pk_..."
                    />
                  </div>
                  <div className={styles.settingRow}>
                    <label>Stripe Secret Key</label>
                    <input
                      type="password"
                      value={settings.stripeSecretKey}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          stripeSecretKey: e.target.value,
                        })
                      }
                      className={styles.input}
                      placeholder="sk_..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* Email Settings */}
            <div className={styles.settingsCard}>
              <div className={styles.cardHeader}>
                <Mail size={24} />
                <h2>Email Configuration</h2>
              </div>
              <div className={styles.settingRow}>
                <label>SMTP Host</label>
                <input
                  type="text"
                  placeholder="smtp.example.com"
                  className={styles.input}
                />
              </div>
              <div className={styles.settingRow}>
                <label>SMTP Port</label>
                <input
                  type="number"
                  placeholder="587"
                  className={styles.input}
                />
              </div>
              <div className={styles.settingRow}>
                <label>SMTP Username</label>
                <input
                  type="text"
                  placeholder="user@example.com"
                  className={styles.input}
                />
              </div>
              <div className={styles.settingRow}>
                <label>SMTP Password</label>
                <input type="password" className={styles.input} />
              </div>
            </div>
          </div>

          <div className={styles.saveButton}>
            <button onClick={handleSave} className={styles.primaryBtn}>
              <Zap size={20} />
              Save All Settings
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
