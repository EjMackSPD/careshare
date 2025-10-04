"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import {
  Search,
  Calendar,
  Clock,
  User,
  Tag,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./page.module.css";
import homeStyles from "../page.module.css";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  authorTitle: string | null;
  readTime: number;
  publishedAt: string;
  views: number;
};

const categoryLabels: { [key: string]: string } = {
  CAREGIVING_TIPS: "Caregiving Tips",
  FAMILY_STORIES: "Family Stories",
  HEALTH_WELLNESS: "Health & Wellness",
  FINANCIAL_PLANNING: "Financial Planning",
  TECHNOLOGY: "Technology",
  LEGAL_MATTERS: "Legal Matters",
  COMPANY_NEWS: "Company News",
};

const categoryColors: { [key: string]: string } = {
  CAREGIVING_TIPS: "#6366f1",
  FAMILY_STORIES: "#ec4899",
  HEALTH_WELLNESS: "#10b981",
  FINANCIAL_PLANNING: "#f59e0b",
  TECHNOLOGY: "#8b5cf6",
  LEGAL_MATTERS: "#ef4444",
  COMPANY_NEWS: "#06b6d4",
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(9);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  async function fetchPosts() {
    try {
      const url =
        selectedCategory === "all"
          ? "/api/blog"
          : `/api/blog?category=${selectedCategory}`;
      console.log("Fetching blog posts from:", url);
      const res = await fetch(url);
      console.log("Response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched posts:", data.length);
        setPosts(data);
      } else {
        console.error("Failed to fetch posts:", res.status);
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);
  const totalPages = Math.ceil(remainingPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = remainingPosts.slice(startIndex, endIndex);

  return (
    <div className={styles.container}>
      <nav className={homeStyles.nav}>
        <div className={homeStyles.navContainer}>
          <Link href="/" className={homeStyles.logo}>
            <Image
              src="/careshare-logo.png"
              alt="CareShare Logo"
              width={200}
              height={75}
              priority
            />
          </Link>
          <div className={homeStyles.navLinks}>
            <Link href="/features">Features</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/partnerships">Partnerships</Link>
            <Link href="/login">Login</Link>
            <Link href="/signup" className={homeStyles.signupBtn}>
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <h1>CareShare Blog</h1>
          <p>
            Expert advice, inspiring stories, and practical tips for family
            caregivers
          </p>
        </div>

        {/* Search and Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.categories}>
            <button
              onClick={() => setSelectedCategory("all")}
              className={`${styles.categoryBtn} ${
                selectedCategory === "all" ? styles.active : ""
              }`}
            >
              All Categories
            </button>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`${styles.categoryBtn} ${
                  selectedCategory === key ? styles.active : ""
                }`}
                style={
                  selectedCategory === key
                    ? {
                        borderColor: categoryColors[key],
                        color: categoryColors[key],
                      }
                    : {}
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={48} />
            <h3>No articles found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className={styles.featuredPost}
              >
                <div className={styles.featuredContent}>
                  <div className={styles.featuredMeta}>
                    <span
                      className={styles.categoryBadge}
                      style={{
                        background: categoryColors[featuredPost.category],
                      }}
                    >
                      <Tag size={14} />
                      {categoryLabels[featuredPost.category]}
                    </span>
                    <span className={styles.featured}>Featured</span>
                  </div>
                  <h2>{featuredPost.title}</h2>
                  <p>{featuredPost.excerpt}</p>
                  <div className={styles.postMeta}>
                    <div className={styles.metaItem}>
                      <User size={16} />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Calendar size={16} />
                      <span>
                        {new Date(
                          featuredPost.publishedAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.metaItem}>
                      <Clock size={16} />
                      <span>{featuredPost.readTime} min read</span>
                    </div>
                    <div className={styles.metaItem}>
                      <TrendingUp size={16} />
                      <span>{featuredPost.views} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Blog Grid */}
            <div className={styles.postsGrid}>
              {paginatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={styles.postCard}
                >
                  <span
                    className={styles.categoryBadge}
                    style={{ background: categoryColors[post.category] }}
                  >
                    <Tag size={14} />
                    {categoryLabels[post.category]}
                  </span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className={styles.postFooter}>
                    <div className={styles.author}>
                      <div className={styles.authorAvatar}>
                        {post.author[0]}
                      </div>
                      <div className={styles.authorInfo}>
                        <div className={styles.authorName}>{post.author}</div>
                        {post.authorTitle && (
                          <div className={styles.authorTitle}>
                            {post.authorTitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.postStats}>
                      <div className={styles.metaItem}>
                        <Clock size={14} />
                        <span>{post.readTime} min</span>
                      </div>
                      <div className={styles.metaItem}>
                        <TrendingUp size={14} />
                        <span>{post.views}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={styles.pageBtn}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                <div className={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={styles.pageBtn}
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
