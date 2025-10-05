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
  X,
  Plus,
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

type FamilyMember = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type AvailableUser = {
  id: string;
  name: string | null;
  email: string;
};

export default function ManageFamiliesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [viewingFamily, setViewingFamily] = useState<Family | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("CARE_RECIPIENT");

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

  const handleViewFamily = (family: Family) => {
    setViewingFamily(family);
    setShowViewModal(true);
  };

  const handleEditFamily = async (family: Family) => {
    setEditingFamily(family);
    setFormData({
      name: family.name,
      description: family.description || "",
    });

    // Fetch family members and available users
    try {
      const membersRes = await fetch(`/api/families/${family.id}/members`);
      const usersRes = await fetch("/api/admin/users");

      if (membersRes.ok && usersRes.ok) {
        const members = await membersRes.json();
        const allUsers = await usersRes.json();

        setFamilyMembers(members);

        // Filter out users already in the family
        const memberUserIds = new Set(members.map((m: any) => m.userId));
        const available = allUsers.filter((u: any) => !memberUserIds.has(u.id));
        setAvailableUsers(available);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }

    setShowEditModal(true);
  };

  const handleAddFamily = async () => {
    setEditingFamily(null);
    setFormData({
      name: "",
      description: "",
    });
    setFamilyMembers([]);

    // Fetch all users to show available users to add
    try {
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const allUsers = await usersRes.json();
        setAvailableUsers(allUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }

    setShowAddModal(true);
  };

  const handleSaveFamily = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingFamily) {
        // Update existing family
        const res = await fetch(`/api/admin/families/${editingFamily.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const updatedFamily = await res.json();
          setFamilies(
            families.map((f) => (f.id === editingFamily.id ? updatedFamily : f))
          );
          setShowEditModal(false);
          alert("Family updated successfully!");
        } else {
          alert("Failed to update family");
        }
      } else {
        // Create new family
        const res = await fetch("/api/admin/families", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          const newFamily = await res.json();

          // Add members to the newly created family
          if (familyMembers.length > 0) {
            for (const member of familyMembers) {
              await fetch(`/api/families/${newFamily.id}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: member.user.id,
                  role: member.role,
                }),
              });
            }
            // Update the count
            newFamily.membersCount = familyMembers.length;
          }

          setFamilies([newFamily, ...families]);
          setShowAddModal(false);
          setFamilyMembers([]);
          alert("Family created successfully!");
        } else {
          alert("Failed to create family");
        }
      }
    } catch (error) {
      console.error("Error saving family:", error);
      alert("An error occurred");
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    const selectedUser = availableUsers.find((u) => u.id === selectedUserId);
    if (!selectedUser) return;

    if (editingFamily) {
      // For existing family, make API call
      try {
        const res = await fetch(`/api/families/${editingFamily.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUserId,
            role: selectedRole,
          }),
        });

        if (res.ok) {
          const newMember = await res.json();
          setFamilyMembers([...familyMembers, newMember]);

          // Remove from available users
          setAvailableUsers(
            availableUsers.filter((u) => u.id !== selectedUserId)
          );
          setSelectedUserId("");
          setSelectedRole("CARE_RECIPIENT");

          // Update family count in list
          setFamilies(
            families.map((f) =>
              f.id === editingFamily.id
                ? { ...f, membersCount: f.membersCount + 1 }
                : f
            )
          );
        } else {
          alert("Failed to add member");
        }
      } catch (error) {
        console.error("Error adding member:", error);
        alert("An error occurred");
      }
    } else {
      // For new family, just update local state
      const tempMember: FamilyMember = {
        id: `temp-${Date.now()}`,
        role: selectedRole,
        user: selectedUser,
      };

      setFamilyMembers([...familyMembers, tempMember]);
      setAvailableUsers(availableUsers.filter((u) => u.id !== selectedUserId));
      setSelectedUserId("");
      setSelectedRole("CARE_RECIPIENT");
    }
  };

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (
      !confirm("Are you sure you want to remove this member from the family?")
    ) {
      return;
    }

    if (editingFamily) {
      // For existing family, make API call
      try {
        const res = await fetch(
          `/api/families/${editingFamily.id}/members/${memberId}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          const removedMember = familyMembers.find((m) => m.id === memberId);
          setFamilyMembers(familyMembers.filter((m) => m.id !== memberId));

          // Add back to available users
          if (removedMember) {
            setAvailableUsers([...availableUsers, removedMember.user]);
          }

          // Update family count in list
          setFamilies(
            families.map((f) =>
              f.id === editingFamily.id
                ? { ...f, membersCount: f.membersCount - 1 }
                : f
            )
          );
        } else {
          alert("Failed to remove member");
        }
      } catch (error) {
        console.error("Error removing member:", error);
        alert("An error occurred");
      }
    } else {
      // For new family, just update local state
      const removedMember = familyMembers.find((m) => m.id === memberId);
      setFamilyMembers(familyMembers.filter((m) => m.id !== memberId));

      // Add back to available users
      if (removedMember) {
        setAvailableUsers([...availableUsers, removedMember.user]);
      }
    }
  };

  const handleDeleteFamily = async (familyId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this family? This will also delete all related data (tasks, events, etc.). This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/families/${familyId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFamilies(families.filter((f) => f.id !== familyId));
        alert("Family deleted successfully!");
      } else {
        alert("Failed to delete family");
      }
    } catch (error) {
      console.error("Error deleting family:", error);
      alert("An error occurred");
    }
  };

  const filteredFamilies = families.filter((family) =>
    family.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: families.length,
    totalMembers: families.reduce((sum, f) => sum + f.membersCount, 0),
    totalTasks: families.reduce((sum, f) => sum + f.tasksCount, 0),
    totalEvents: families.reduce((sum, f) => sum + f.eventsCount, 0),
  };

  if (status === "loading") {
    return (
      <div className={styles.container}>
        <Navigation showAuthLinks={true} />
        <div className={styles.layout}>
          <LeftNavigation />
          <main className={styles.main}>
            <div style={{ textAlign: "center", padding: "3rem" }}>
              Loading...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push("/dashboard");
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
            <button onClick={handleAddFamily} className={styles.addButton}>
              <Plus size={20} />
              Add Family
            </button>
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
                            onClick={() => handleViewFamily(family)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            title="Edit family"
                            onClick={() => handleEditFamily(family)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            title="Delete family"
                            onClick={() => handleDeleteFamily(family.id)}
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

      {/* View Family Modal */}
      {showViewModal && viewingFamily && (
        <div className={styles.modal} onClick={() => setShowViewModal(false)}>
          <div
            className={styles.viewModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Section */}
            <div className={styles.viewHero}>
              <div className={styles.familyAvatarLarge}>
                {viewingFamily.name[0].toUpperCase()}
              </div>
              <h2>{viewingFamily.name}</h2>
              <p className={styles.viewSubtitle}>
                {viewingFamily.description || "No description provided"}
              </p>
              <button
                className={styles.closeBtn}
                onClick={() => setShowViewModal(false)}
                style={{ position: "absolute", top: "1rem", right: "1rem" }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className={styles.viewStats}>
              <div className={styles.viewStatCard}>
                <div
                  className={styles.viewStatIcon}
                  style={{ background: "#dbeafe" }}
                >
                  <Users size={24} style={{ color: "#2563eb" }} />
                </div>
                <div className={styles.viewStatValue}>
                  {viewingFamily.membersCount}
                </div>
                <div className={styles.viewStatLabel}>Family Members</div>
              </div>

              <div className={styles.viewStatCard}>
                <div
                  className={styles.viewStatIcon}
                  style={{ background: "#fef3c7" }}
                >
                  <Edit2 size={24} style={{ color: "#ca8a04" }} />
                </div>
                <div className={styles.viewStatValue}>
                  {viewingFamily.tasksCount}
                </div>
                <div className={styles.viewStatLabel}>Active Tasks</div>
              </div>

              <div className={styles.viewStatCard}>
                <div
                  className={styles.viewStatIcon}
                  style={{ background: "#dcfce7" }}
                >
                  <Calendar size={24} style={{ color: "#16a34a" }} />
                </div>
                <div className={styles.viewStatValue}>
                  {viewingFamily.eventsCount}
                </div>
                <div className={styles.viewStatLabel}>Scheduled Events</div>
              </div>
            </div>

            {/* Details */}
            <div className={styles.viewDetails}>
              <div className={styles.viewDetailRow}>
                <div className={styles.viewDetailIcon}>
                  <Calendar size={18} style={{ color: "#6366f1" }} />
                </div>
                <div>
                  <div className={styles.viewDetailLabel}>Created On</div>
                  <div className={styles.viewDetailValue}>
                    {new Date(viewingFamily.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.viewDetailRow}>
                <div className={styles.viewDetailIcon}>
                  <UsersRound size={18} style={{ color: "#6366f1" }} />
                </div>
                <div>
                  <div className={styles.viewDetailLabel}>Family ID</div>
                  <div
                    className={styles.viewDetailValue}
                    style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}
                  >
                    {viewingFamily.id}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.viewActions}>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditFamily(viewingFamily);
                }}
                className={styles.viewActionBtn}
                style={{ background: "#6366f1", color: "white" }}
              >
                <Edit2 size={18} />
                Edit Family
              </button>
              <button
                onClick={() => router.push(`/family/${viewingFamily.id}`)}
                className={styles.viewActionBtn}
                style={{ background: "#10b981", color: "white" }}
              >
                <Eye size={18} />
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Family Modal */}
      {showEditModal && (
        <div className={styles.modal} onClick={() => setShowEditModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px" }}
          >
            <div className={styles.modalHeader}>
              <h2>Edit Family</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowEditModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveFamily}>
              <div className={styles.formGroup}>
                <label>Family Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter family name"
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows={4}
                  className={styles.input}
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Family Members Section */}
              <div className={styles.membersSection}>
                <h3>
                  <Users size={20} />
                  Family Members ({familyMembers.length})
                </h3>

                {/* Current Members */}
                <div className={styles.membersList}>
                  {familyMembers.length === 0 ? (
                    <div className={styles.emptyMembers}>
                      <Users size={32} style={{ color: "#cbd5e1" }} />
                      <p>No members yet</p>
                    </div>
                  ) : (
                    familyMembers.map((member) => (
                      <div key={member.id} className={styles.memberCard}>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberAvatar}>
                            {member.user.name?.[0]?.toUpperCase() ||
                              member.user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.memberName}>
                              {member.user.name || member.user.email}
                            </div>
                            <div className={styles.memberEmail}>
                              {member.user.email}
                            </div>
                          </div>
                        </div>
                        <div className={styles.memberActions}>
                          <span className={styles.roleBadge}>
                            {member.role}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(member.id, member.user.id)
                            }
                            className={styles.removeMemberBtn}
                            title="Remove member"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Member */}
                {availableUsers.length > 0 && (
                  <div className={styles.addMemberSection}>
                    <h4>Add Member</h4>
                    <div className={styles.addMemberForm}>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className={styles.memberSelect}
                      >
                        <option value="">Select a user...</option>
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email} ({user.email})
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="CARE_RECIPIENT">Care Recipient</option>
                        <option value="CARE_MANAGER">Care Manager</option>
                        <option value="FAMILY_MEMBER">Family Member</option>
                        <option value="CONTRIBUTOR">Contributor</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        disabled={!selectedUserId}
                        className={styles.addMemberBtn}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                )}
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

      {/* Add Family Modal */}
      {showAddModal && (
        <div className={styles.modal} onClick={() => setShowAddModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "700px" }}
          >
            <div className={styles.modalHeader}>
              <h2>Add New Family</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setShowAddModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveFamily}>
              <div className={styles.formGroup}>
                <label>Family Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter family name"
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter description"
                  rows={4}
                  className={styles.input}
                  style={{ resize: "vertical" }}
                />
              </div>

              {/* Family Members Section */}
              <div className={styles.membersSection}>
                <h3>
                  <Users size={20} />
                  Add Family Members ({familyMembers.length})
                </h3>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#64748b",
                    marginTop: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  Add members to this family. You can add more later.
                </p>

                {/* Current Members */}
                <div className={styles.membersList}>
                  {familyMembers.length === 0 ? (
                    <div className={styles.emptyMembers}>
                      <Users size={32} style={{ color: "#cbd5e1" }} />
                      <p>No members added yet</p>
                    </div>
                  ) : (
                    familyMembers.map((member) => (
                      <div key={member.id} className={styles.memberCard}>
                        <div className={styles.memberInfo}>
                          <div className={styles.memberAvatar}>
                            {member.user.name?.[0]?.toUpperCase() ||
                              member.user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className={styles.memberName}>
                              {member.user.name || member.user.email}
                            </div>
                            <div className={styles.memberEmail}>
                              {member.user.email}
                            </div>
                          </div>
                        </div>
                        <div className={styles.memberActions}>
                          <span className={styles.roleBadge}>
                            {member.role}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(member.id, member.user.id)
                            }
                            className={styles.removeMemberBtn}
                            title="Remove member"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Member */}
                {availableUsers.length > 0 && (
                  <div className={styles.addMemberSection}>
                    <h4>Add Member</h4>
                    <div className={styles.addMemberForm}>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className={styles.memberSelect}
                      >
                        <option value="">Select a user...</option>
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email} ({user.email})
                          </option>
                        ))}
                      </select>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="CARE_RECIPIENT">Care Recipient</option>
                        <option value="CARE_MANAGER">Care Manager</option>
                        <option value="FAMILY_MEMBER">Family Member</option>
                        <option value="CONTRIBUTOR">Contributor</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        disabled={!selectedUserId}
                        className={styles.addMemberBtn}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                )}
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
                  <Plus size={18} />
                  Create Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
