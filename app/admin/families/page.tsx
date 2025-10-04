"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  UsersRound,
  Search,
  Users,
  Calendar,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import styles from "../users/page.module.css";

type Family = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  membersCount: number;
  tasksCount: number;
  eventsCount: number;
};

export default function ManageFamiliesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (isAdmin) {
      fetchFamilies();
    }
  }, [isAdmin]);

  async function fetchFamilies() {
    try {
      const res = await fetch("/api/admin/families");
      if (res.ok) {
        const data = await res.json();
        setFamilies(data);
      }
    } catch (error) {
      console.error("Error fetching families:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredFamilies = families.filter((family) =>
    family.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: families.length,
    totalMembers: families.reduce((sum, f) => sum + f.membersCount, 0),
    totalTasks: families.reduce((sum, f) => sum + f.tasksCount, 0),
    totalEvents: families.reduce((sum, f) => sum + f.eventsCount, 0),
  };

  if (status === "loading" || !isAdmin) {
    return null;
  }

  return (
    <div className={styles.container}>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />

        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.headerIcon}>
                <UsersRound size={32} />
              </div>
              <div>
                <h1>Manage Families</h1>
                <p>View and manage all families on the platform</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#dbeafe" }}
              >
                <UsersRound size={24} style={{ color: "#2563eb" }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total}</div>
                <div className={styles.statLabel}>Total Families</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#dcfce7" }}
              >
                <Users size={24} style={{ color: "#16a34a" }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.totalMembers}</div>
                <div className={styles.statLabel}>Total Members</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#fef3c7" }}
              >
                <Calendar size={24} style={{ color: "#ca8a04" }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.totalEvents}</div>
                <div className={styles.statLabel}>Total Events</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#e9d5ff" }}
              >
                <Edit2 size={24} style={{ color: "#7c3aed" }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.totalTasks}</div>
                <div className={styles.statLabel}>Total Tasks</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search families..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Families Table */}
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading families...</p>
              </div>
            ) : filteredFamilies.length === 0 ? (
              <div className={styles.emptyState}>
                <UsersRound size={48} />
                <h3>No families found</h3>
                <p>Try adjusting your search</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Family Name</th>
                    <th>Description</th>
                    <th>Members</th>
                    <th>Tasks</th>
                    <th>Events</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFamilies.map((family) => (
                    <tr key={family.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar}>
                            {family.name[0].toUpperCase()}
                          </div>
                          <strong>{family.name}</strong>
                        </div>
                      </td>
                      <td>{family.description || "No description"}</td>
                      <td>{family.membersCount}</td>
                      <td>{family.tasksCount}</td>
                      <td>{family.eventsCount}</td>
                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={14} />
                          {new Date(family.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            title="View family"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            title="Edit family"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            title="Delete family"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.resultsInfo}>
            Showing {filteredFamilies.length} of {families.length} families
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
