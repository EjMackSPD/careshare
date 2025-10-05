"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import LeftNavigation from "@/app/components/LeftNavigation";
import Footer from "@/app/components/Footer";
import RichTextEditor from "@/app/components/RichTextEditor";
import {
  FileText,
  Search,
  Edit2,
  Trash2,
  Plus,
  X,
  TrendingUp,
  Calendar,
  User,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./page.module.css";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  authorTitle: string | null;
  coverImage: string | null;
  readTime: number;
  published: boolean;
  publishedAt: Date | null;
  views: number;
  relatedPostIds: string[];
  createdAt: Date;
};

const categoryOptions = [
  { value: "CAREGIVING_TIPS", label: "Caregiving Tips" },
  { value: "FAMILY_STORIES", label: "Family Stories" },
  { value: "HEALTH_WELLNESS", label: "Health & Wellness" },
  { value: "FINANCIAL_PLANNING", label: "Financial Planning" },
  { value: "TECHNOLOGY", label: "Technology" },
  { value: "LEGAL_MATTERS", label: "Legal Matters" },
  { value: "COMPANY_NEWS", label: "Company News" },
];

export default function ManageBlogPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "CAREGIVING_TIPS",
    author: "",
    authorTitle: "",
    coverImage: "",
    readTime: 5,
    published: false,
    relatedPostIds: [] as string[],
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

  useEffect(() => {
    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin]);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddPost = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "CAREGIVING_TIPS",
      author: "",
      authorTitle: "",
      coverImage: "",
      readTime: 5,
      published: false,
    });
    setShowAddModal(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      author: post.author,
      authorTitle: post.authorTitle || "",
      coverImage: post.coverImage || "",
      readTime: post.readTime,
      published: post.published,
      relatedPostIds: post.relatedPostIds || [],
    });
    setShowEditModal(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPost
        ? `/api/admin/blog/${editingPost.id}`
        : "/api/admin/blog";
      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          publishedAt: formData.published ? new Date() : null,
        }),
      });

      if (response.ok) {
        const savedPost = await response.json();
        if (editingPost) {
          setPosts(posts.map((p) => (p.id === savedPost.id ? savedPost : p)));
        } else {
          setPosts([savedPost, ...posts]);
        }
        setShowEditModal(false);
        setShowAddModal(false);
        setEditingPost(null);
        alert("Blog post saved successfully!");
      } else {
        alert("Failed to save blog post");
      }
    } catch (error) {
      console.error("Error saving blog post:", error);
      alert("An error occurred");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const res = await fetch(`/api/admin/blog/${postId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== postId));
        alert("Blog post deleted successfully!");
      } else {
        alert("Failed to delete blog post");
      }
    } catch (error) {
      console.error("Error deleting blog post:", error);
      alert("An error occurred");
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...post,
          published: !post.published,
          publishedAt: !post.published ? new Date() : post.publishedAt,
        }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
    }
  };

  // Filter posts based on search and filters
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || post.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && post.published) ||
      (statusFilter === "draft" && !post.published);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter]);

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.published).length,
    drafts: posts.filter((p) => !p.published).length,
    totalViews: posts.reduce((sum, p) => sum + p.views, 0),
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
    <>
      <Navigation showAuthLinks={true} />

      <div className={styles.layout}>
        <LeftNavigation />

        <main className={styles.main}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <h1>
                <FileText size={32} />
                Blog Management
              </h1>
            </div>
            <button onClick={handleAddPost} className={styles.addButton}>
              <Plus size={20} />
              New Post
            </button>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Posts</h3>
              <p>{stats.total}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Published</h3>
              <p>{stats.published}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Drafts</h3>
              <p>{stats.drafts}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Views</h3>
              <p>{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.container}>
            <div className={styles.controls}>
              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={20} />
                <input
                  type="text"
                  placeholder="Search by title, author, or excerpt..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Posts Table */}
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : paginatedPosts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        No blog posts found
                      </td>
                    </tr>
                  ) : (
                    paginatedPosts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.postTitleLink}
                        >
                          {post.title}
                        </Link>
                        <div className={styles.postSlug}>{post.slug}</div>
                      </td>
                      <td>
                        <div>{post.author}</div>
                        {post.authorTitle && (
                          <div
                            style={{ fontSize: "0.875rem", color: "#64748b" }}
                          >
                            {post.authorTitle}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={styles.badge}>
                          {
                            categoryOptions.find(
                              (c) => c.value === post.category
                            )?.label
                          }
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className={`${styles.statusBadge} ${
                            post.published ? styles.active : styles.inactive
                          }`}
                        >
                          {post.published ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td>{post.views.toLocaleString()}</td>
                      <td>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handleEditPost(post)}
                            className={styles.actionBtn}
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className={`${styles.actionBtn} ${styles.danger}`}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <div className={styles.paginationInfo}>
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredPosts.length)} of{" "}
                    {filteredPosts.length} posts
                  </div>
                  <div className={styles.paginationControls}>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={styles.pageBtn}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current, and adjacent pages
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`${styles.pageBtn} ${
                              currentPage === page ? styles.active : ""
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page}>...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={styles.pageBtn}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>

      <Footer />

      {/* Add/Edit Modal */}
      {(showEditModal || showAddModal) && (
        <div
          className={styles.modal}
          onClick={() => {
            setShowEditModal(false);
            setShowAddModal(false);
          }}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "900px" }}
          >
            <div className={styles.modalHeader}>
              <h2>{editingPost ? "Edit Blog Post" : "New Blog Post"}</h2>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowEditModal(false);
                  setShowAddModal(false);
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSavePost}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData({
                      ...formData,
                      title,
                      slug: title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, ""),
                    });
                  }}
                  required
                  placeholder="e.g., 10 Tips for New Caregivers"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Slug (URL) *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                  placeholder="e.g., 10-tips-new-caregivers"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Excerpt *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  required
                  rows={3}
                  placeholder="Brief summary shown in blog list..."
                  className={styles.input}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Content *</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                  placeholder="Write your blog post content here..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <LinkIcon size={16} style={{ display: "inline", marginRight: "0.5rem" }} />
                  Related Posts (Cross-Reference)
                </label>
                <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.75rem" }}>
                  Select up to 3 related blog posts to display at the end of this article
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {posts
                    .filter((p) => p.id !== editingPost?.id)
                    .map((post) => (
                      <label
                        key={post.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          background: formData.relatedPostIds.includes(post.id)
                            ? "#f0f9ff"
                            : "white",
                          transition: "all 0.2s",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.relatedPostIds.includes(post.id)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setFormData({
                              ...formData,
                              relatedPostIds: isChecked
                                ? [...formData.relatedPostIds, post.id].slice(0, 3)
                                : formData.relatedPostIds.filter((id) => id !== post.id),
                            });
                          }}
                          disabled={
                            !formData.relatedPostIds.includes(post.id) &&
                            formData.relatedPostIds.length >= 3
                          }
                          style={{ marginRight: "0.75rem" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>
                            {post.title}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                            {categoryOptions.find((c) => c.value === post.category)?.label} •{" "}
                            {post.readTime} min read
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                    className={styles.input}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Read Time (minutes) *</label>
                  <input
                    type="number"
                    value={formData.readTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readTime: parseInt(e.target.value),
                      })
                    }
                    required
                    min="1"
                    max="60"
                    className={styles.input}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className={styles.formGroup}>
                  <label>Author *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    required
                    placeholder="e.g., Dr. Sarah Mitchell"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Author Title</label>
                  <input
                    type="text"
                    value={formData.authorTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, authorTitle: e.target.value })
                    }
                    placeholder="e.g., Senior Care Specialist"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Cover Image URL</label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData({ ...formData, coverImage: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/photo-..."
                  className={styles.input}
                />
                <small style={{ color: "#64748b", fontSize: "0.875rem" }}>
                  Recommended: 1920x1080px, Use Unsplash for high-quality images
                </small>
              </div>

              <div className={styles.formGroup}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                  />
                  Publish immediately
                </label>
              </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setShowAddModal(false);
                  }}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingPost ? "Update Post" : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
