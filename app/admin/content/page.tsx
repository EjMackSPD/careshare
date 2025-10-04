"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  FileText,
  Gift,
  UtensilsCrossed,
  BookOpen,
  Image,
  Video,
  Plus,
} from "lucide-react";
import styles from "../users/page.module.css";

export default function ContentManagementPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

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

  const contentTypes = [
    {
      title: "Gift Marketplace",
      icon: <Gift size={32} />,
      description: "Manage gift suggestions and vendors",
      count: "12 items",
      color: "#dbeafe",
      iconColor: "#2563eb",
    },
    {
      title: "Food Delivery",
      icon: <UtensilsCrossed size={32} />,
      description: "Manage food delivery services and restaurants",
      count: "15 services",
      color: "#dcfce7",
      iconColor: "#16a34a",
    },
    {
      title: "Resources Library",
      icon: <BookOpen size={32} />,
      description: "Manage educational resources and guides",
      count: "27 resources",
      color: "#fef3c7",
      iconColor: "#ca8a04",
    },
    {
      title: "Media Library",
      icon: <Image size={32} />,
      description: "Manage images, videos, and documents",
      count: "45 files",
      color: "#e9d5ff",
      iconColor: "#7c3aed",
    },
    {
      title: "Video Content",
      icon: <Video size={32} />,
      description: "Manage tutorial and educational videos",
      count: "8 videos",
      color: "#fecaca",
      iconColor: "#dc2626",
    },
    {
      title: "Blog Posts",
      icon: <FileText size={32} />,
      description: "Manage blog posts and articles",
      count: "23 posts",
      color: "#fed7aa",
      iconColor: "#ea580c",
    },
  ];

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />

        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerIcon}>
                <FileText size={32} />
              </div>
              <div>
                <h1>Content Management</h1>
                <p>Manage all platform content and media</p>
              </div>
            </div>
          </div>

          <div className={styles.statsGrid}>
            {contentTypes.map((type, index) => (
              <div
                key={index}
                className={styles.statCard}
                style={{ cursor: "pointer" }}
              >
                <div
                  className={styles.statIcon}
                  style={{ background: type.color }}
                >
                  <div style={{ color: type.iconColor }}>{type.icon}</div>
                </div>
                <div className={styles.statContent}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "1.125rem",
                      color: "#1e293b",
                    }}
                  >
                    {type.title}
                  </div>
                  <div className={styles.statLabel}>{type.description}</div>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      color: "#6366f1",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    {type.count}
                  </div>
                </div>
                <button
                  style={{
                    padding: "0.5rem",
                    background: "#6366f1",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={20} />
                </button>
              </div>
            ))}
          </div>

          <div
            style={{ marginTop: "3rem", textAlign: "center", color: "#64748b" }}
          >
            <FileText
              size={64}
              style={{ margin: "0 auto 1rem", opacity: 0.3 }}
            />
            <p>Select a content type above to manage items</p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
