"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import {
  Users,
  Search,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  UserPlus,
} from "lucide-react";
import styles from "./page.module.css";

type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  createdAt: Date;
  role: string;
  status: string;
  familiesCount: number;
};

export default function ManageUsersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    status: "active",
  });

  // Check if user is admin
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
      fetchUsers();
    }
  }, [isAdmin]);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setShowEditModal(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "user",
      status: "active",
    });
    setShowAddModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Update existing user
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updatedUser = await res.json();
          setUsers(
            users.map((u) => (u.id === editingUser.id ? updatedUser : u))
          );
          setShowEditModal(false);
          alert("User updated successfully!");
        } else {
          alert("Failed to update user");
        }
      } else {
        // Create new user
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newUser = await res.json();
          setUsers([newUser, ...users]);
          setShowAddModal(false);
          alert("User created successfully!");
        } else {
          alert("Failed to create user");
        }
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("An error occurred");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        alert("User deleted successfully!");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    inactive: users.filter((u) => u.status === "inactive").length,
    admins: users.filter((u) => u.role === "admin").length,
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
                <Users size={32} />
              </div>
              <div>
                <h1>Manage Users</h1>
                <p>View and manage all platform users</p>
              </div>
            </div>
            <button onClick={handleAddUser} className={styles.addButton}>
              <UserPlus size={20} />
              Add User
            </button>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#dbeafe" }}
              >
                <Users size={24} style={{ color: "#2563eb" }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total}</div>
                <div className={styles.statLabel}>Total Users</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#dcfce7" }}
              >
                <CheckCircle size={24} style={{ color: "#16a34a" }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.active}</div>
                <div className={styles.statLabel}>Active Users</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#fee2e2" }}
              >
                <Ban size={24} style={{ color: "#dc2626" }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.inactive}</div>
                <div className={styles.statLabel}>Inactive Users</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#fef3c7" }}
              >
                <Shield size={24} style={{ color: "#ca8a04" }} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.admins}</div>
                <div className={styles.statLabel}>Administrators</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Users Table */}
          <div className={styles.tableContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <Users size={48} />
                <h3>No users found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Families</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.userAvatar}>
                            {user.name?.[0]?.toUpperCase() ||
                              user.email[0].toUpperCase()}
                          </div>
                          <span>{user.name || "No name"}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.emailCell}>
                          <Mail size={14} />
                          {user.email}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            user.role === "admin"
                              ? styles.badgeAdmin
                              : styles.badgeUser
                          }`}
                        >
                          {user.role === "admin" ? (
                            <Shield size={12} />
                          ) : (
                            <Users size={12} />
                          )}
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            user.status === "active"
                              ? styles.badgeActive
                              : styles.badgeInactive
                          }`}
                        >
                          {user.status === "active" ? (
                            <CheckCircle size={12} />
                          ) : (
                            <Ban size={12} />
                          )}
                          {user.status}
                        </span>
                      </td>
                      <td>{user.familiesCount}</td>
                      <td>
                        <div className={styles.dateCell}>
                          <Calendar size={14} />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            title="Edit user"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            title="Delete user"
                            onClick={() => handleDeleteUser(user.id)}
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
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </main>
      </div>

      <Footer />

      {/* Edit User Modal */}
      {showEditModal && (
        <div className={styles.modal} onClick={() => setShowEditModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Edit User</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowEditModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter name"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email"
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className={styles.input}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={styles.input}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Add New User</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAddModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter name"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email"
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className={styles.input}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className={styles.input}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  <UserPlus size={18} />
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
