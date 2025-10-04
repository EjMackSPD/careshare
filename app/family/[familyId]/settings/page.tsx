"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import { Bell, Mail, Phone, MessageSquare } from "lucide-react";
import styles from "./page.module.css";

type Family = {
  id: string;
  name: string;
  elderName: string | null;
  elderPhone: string | null;
  elderAddress: string | null;
  elderBirthday: string | null;
  emergencyContact: string | null;
  medicalNotes: string | null;
  description: string | null;
};

export default function FamilySettings() {
  const params = useParams();
  const router = useRouter();
  const familyId = params.familyId as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    elderName: "",
    elderPhone: "",
    elderAddress: "",
    elderBirthday: "",
    emergencyContact: "",
    medicalNotes: "",
    description: "",
  });

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    methods: {
      email: true,
      sms: true,
      phoneCall: false,
      pushNotification: true,
    },
    alertTypes: {
      billsDue: true,
      billsPaid: true,
      upcomingEvents: true,
      medicationReminders: true,
      taskAssigned: true,
      newMessages: true,
      emergencyAlerts: true,
      weeklyDigest: true,
    },
  });

  useEffect(() => {
    fetchFamily();
  }, [familyId]);

  const fetchFamily = async () => {
    try {
      const response = await fetch("/api/families");
      if (response.ok) {
        const families = await response.json();
        const family = families.find((f: Family) => f.id === familyId);
        if (family) {
          setFormData({
            name: family.name || "",
            elderName: family.elderName || "",
            elderPhone: family.elderPhone || "",
            elderAddress: family.elderAddress || "",
            elderBirthday: family.elderBirthday
              ? new Date(family.elderBirthday).toISOString().split("T")[0]
              : "",
            emergencyContact: family.emergencyContact || "",
            medicalNotes: family.medicalNotes || "",
            description: family.description || "",
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching family:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      // TODO: Create a PATCH endpoint for updating family
      const response = await fetch(`/api/families/${familyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => router.push(`/family/${familyId}`), 1500);
      } else {
        setMessage("Failed to save settings");
      }
    } catch (error) {
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Navigation
        backLink={{ href: `/family/${familyId}`, label: "Back to Family" }}
      />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Family Settings</h1>
          <p>Manage care recipient information and family details</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {message && (
            <div
              className={`${styles.message} ${
                message.includes("success") ? styles.success : styles.error
              }`}
            >
              {message}
            </div>
          )}

          <section className={styles.section}>
            <h2>Basic Information</h2>

            <div className={styles.formGroup}>
              <label htmlFor="name">Family Group Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="Smith Family Care Group"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="Brief description of your care coordination..."
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2>Care Recipient Details</h2>

            <div className={styles.formGroup}>
              <label htmlFor="elderName">Name</label>
              <input
                id="elderName"
                type="text"
                value={formData.elderName}
                onChange={(e) =>
                  setFormData({ ...formData, elderName: e.target.value })
                }
                placeholder="e.g., Grandma Mary"
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="elderPhone">Phone Number</label>
                <input
                  id="elderPhone"
                  type="tel"
                  value={formData.elderPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, elderPhone: e.target.value })
                  }
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="elderBirthday">Birthday</label>
                <input
                  id="elderBirthday"
                  type="date"
                  value={formData.elderBirthday}
                  onChange={(e) =>
                    setFormData({ ...formData, elderBirthday: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="elderAddress">Address</label>
              <input
                id="elderAddress"
                type="text"
                value={formData.elderAddress}
                onChange={(e) =>
                  setFormData({ ...formData, elderAddress: e.target.value })
                }
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </section>

          <section className={styles.section}>
            <h2>Emergency & Medical Information</h2>

            <div className={styles.formGroup}>
              <label htmlFor="emergencyContact">Emergency Contact</label>
              <input
                id="emergencyContact"
                type="text"
                value={formData.emergencyContact}
                onChange={(e) =>
                  setFormData({ ...formData, emergencyContact: e.target.value })
                }
                placeholder="Name and phone number of emergency contact"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="medicalNotes">Medical Notes & Allergies</label>
              <textarea
                id="medicalNotes"
                value={formData.medicalNotes}
                onChange={(e) =>
                  setFormData({ ...formData, medicalNotes: e.target.value })
                }
                rows={4}
                placeholder="List any medications, allergies, medical conditions, or important notes..."
              />
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <Bell size={24} />
              <div>
                <h2>Notification & Alert Preferences</h2>
                <p className={styles.sectionDescription}>
                  Choose how and when family members receive notifications
                </p>
              </div>
            </div>

            {/* Notification Methods */}
            <div className={styles.preferenceGroup}>
              <h3>Notification Methods</h3>
              <p className={styles.preferenceDescription}>
                Select how you want to receive alerts
              </p>

              <div className={styles.notificationMethods}>
                <label className={styles.methodCard}>
                  <div className={styles.methodHeader}>
                    <Mail size={20} className={styles.methodIcon} />
                    <span className={styles.methodName}>Email</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.methods.email}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        methods: {
                          ...notificationPrefs.methods,
                          email: e.target.checked,
                        },
                      })
                    }
                    className={styles.toggle}
                  />
                  <span className={styles.toggleSlider}></span>
                  <p className={styles.methodDescription}>
                    Receive email notifications for all alerts
                  </p>
                </label>

                <label className={styles.methodCard}>
                  <div className={styles.methodHeader}>
                    <MessageSquare size={20} className={styles.methodIcon} />
                    <span className={styles.methodName}>SMS/Text Message</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.methods.sms}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        methods: {
                          ...notificationPrefs.methods,
                          sms: e.target.checked,
                        },
                      })
                    }
                    className={styles.toggle}
                  />
                  <span className={styles.toggleSlider}></span>
                  <p className={styles.methodDescription}>
                    Get text messages for urgent notifications
                  </p>
                </label>

                <label className={styles.methodCard}>
                  <div className={styles.methodHeader}>
                    <Phone size={20} className={styles.methodIcon} />
                    <span className={styles.methodName}>Phone Call</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.methods.phoneCall}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        methods: {
                          ...notificationPrefs.methods,
                          phoneCall: e.target.checked,
                        },
                      })
                    }
                    className={styles.toggle}
                  />
                  <span className={styles.toggleSlider}></span>
                  <p className={styles.methodDescription}>
                    Receive automated calls for emergencies only
                  </p>
                </label>

                <label className={styles.methodCard}>
                  <div className={styles.methodHeader}>
                    <Bell size={20} className={styles.methodIcon} />
                    <span className={styles.methodName}>
                      Push Notifications
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.methods.pushNotification}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        methods: {
                          ...notificationPrefs.methods,
                          pushNotification: e.target.checked,
                        },
                      })
                    }
                    className={styles.toggle}
                  />
                  <span className={styles.toggleSlider}></span>
                  <p className={styles.methodDescription}>
                    Browser and mobile app notifications
                  </p>
                </label>
              </div>
            </div>

            {/* Alert Types */}
            <div className={styles.preferenceGroup}>
              <h3>Alert Types</h3>
              <p className={styles.preferenceDescription}>
                Choose which events trigger notifications
              </p>

              <div className={styles.alertTypes}>
                <label className={styles.alertOption}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertName}>Bills Due</span>
                    <span className={styles.alertDesc}>
                      Reminders when bills are due soon
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.alertTypes.billsDue}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        alertTypes: {
                          ...notificationPrefs.alertTypes,
                          billsDue: e.target.checked,
                        },
                      })
                    }
                    className={styles.checkbox}
                  />
                </label>

                <label className={styles.alertOption}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertName}>Bills Paid</span>
                    <span className={styles.alertDesc}>
                      Confirmation when bills are marked as paid
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.alertTypes.billsPaid}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        alertTypes: {
                          ...notificationPrefs.alertTypes,
                          billsPaid: e.target.checked,
                        },
                      })
                    }
                    className={styles.checkbox}
                  />
                </label>

                <label className={styles.alertOption}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertName}>Upcoming Events</span>
                    <span className={styles.alertDesc}>
                      Appointments, birthdays, and scheduled visits
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.alertTypes.upcomingEvents}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        alertTypes: {
                          ...notificationPrefs.alertTypes,
                          upcomingEvents: e.target.checked,
                        },
                      })
                    }
                    className={styles.checkbox}
                  />
                </label>

                <label className={styles.alertOption}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertName}>
                      Medication Reminders
                    </span>
                    <span className={styles.alertDesc}>
                      Alerts for medication schedules and refills
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.alertTypes.medicationReminders}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        alertTypes: {
                          ...notificationPrefs.alertTypes,
                          medicationReminders: e.target.checked,
                        },
                      })
                    }
                    className={styles.checkbox}
                  />
                </label>

                <label className={styles.alertOption}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertName}>Task Assignments</span>
                    <span className={styles.alertDesc}>
                      When you're assigned a new task
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.alertTypes.taskAssigned}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        alertTypes: {
                          ...notificationPrefs.alertTypes,
                          taskAssigned: e.target.checked,
                        },
                      })
                    }
                    className={styles.checkbox}
                  />
                </label>

                <label className={styles.alertOption}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertName}>New Messages</span>
                    <span className={styles.alertDesc}>
                      Family member messages and updates
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.alertTypes.newMessages}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        alertTypes: {
                          ...notificationPrefs.alertTypes,
                          newMessages: e.target.checked,
                        },
                      })
                    }
                    className={styles.checkbox}
                  />
                </label>

                <label className={`${styles.alertOption} ${styles.emergency}`}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertName}>
                      🚨 Emergency Alerts
                    </span>
                    <span className={styles.alertDesc}>
                      Critical alerts (always enabled for safety)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.alertTypes.emergencyAlerts}
                    disabled
                    className={styles.checkbox}
                  />
                </label>

                <label className={styles.alertOption}>
                  <div className={styles.alertInfo}>
                    <span className={styles.alertName}>Weekly Digest</span>
                    <span className={styles.alertDesc}>
                      Summary of the week's activities and upcoming items
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.alertTypes.weeklyDigest}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        alertTypes: {
                          ...notificationPrefs.alertTypes,
                          weeklyDigest: e.target.checked,
                        },
                      })
                    }
                    className={styles.checkbox}
                  />
                </label>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={() => {
                  setNotificationPrefs({
                    ...notificationPrefs,
                    alertTypes: Object.keys(
                      notificationPrefs.alertTypes
                    ).reduce(
                      (acc, key) => ({ ...acc, [key]: true }),
                      {} as typeof notificationPrefs.alertTypes
                    ),
                  });
                }}
              >
                Enable All Alerts
              </button>
              <button
                type="button"
                className={styles.quickActionBtn}
                onClick={() => {
                  setNotificationPrefs({
                    ...notificationPrefs,
                    alertTypes: {
                      ...Object.keys(notificationPrefs.alertTypes).reduce(
                        (acc, key) => ({ ...acc, [key]: false }),
                        {} as typeof notificationPrefs.alertTypes
                      ),
                      emergencyAlerts: true, // Always keep emergency enabled
                    },
                  });
                }}
              >
                Disable All Alerts
              </button>
            </div>
          </section>

          <div className={styles.actions}>
            <Link href={`/family/${familyId}`} className={styles.cancelBtn}>
              Cancel
            </Link>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
