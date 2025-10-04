"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Footer from "../../components/Footer";
import MarketingNav from "../../components/MarketingNav";
import {
  Calendar,
  Clock,
  User,
  Tag,
  TrendingUp,
  ArrowLeft,
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

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string);
    }
  }, [params.slug]);

  async function fetchPost(slug: string) {
    try {
      const res = await fetch(`/api/blog/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
      } else {
        router.push("/blog");
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      router.push("/blog");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <MarketingNav />
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className={styles.container}>
      <MarketingNav />

      <main className={styles.main}>
        <Link href="/blog" className={styles.backLink}>
          <ArrowLeft size={20} />
          Back to Blog
        </Link>

        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <span
              className={styles.categoryBadge}
              style={{ background: categoryColors[post.category] }}
            >
              <Tag size={16} />
              {categoryLabels[post.category]}
            </span>
            <h1>{post.title}</h1>
            <p className={styles.excerpt}>{post.excerpt}</p>

            <div className={styles.meta}>
              <div className={styles.author}>
                <div className={styles.authorAvatar}>{post.author[0]}</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{post.author}</div>
                  {post.authorTitle && (
                    <div className={styles.authorTitle}>{post.authorTitle}</div>
                  )}
                </div>
              </div>
              <div className={styles.stats}>
                <div className={styles.metaItem}>
                  <Calendar size={16} />
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.metaItem}>
                  <Clock size={16} />
                  <span>{post.readTime} min read</span>
                </div>
                <div className={styles.metaItem}>
                  <TrendingUp size={16} />
                  <span>{post.views} views</span>
                </div>
              </div>
            </div>
          </header>

          <div className={styles.content}>
            {post.content.split("\n").map((paragraph, index) => {
              if (paragraph.startsWith("## ")) {
                return <h2 key={index}>{paragraph.replace("## ", "")}</h2>;
              } else if (paragraph.startsWith("### ")) {
                return <h3 key={index}>{paragraph.replace("### ", "")}</h3>;
              } else if (paragraph.startsWith("| ")) {
                // Skip table rows (would need more complex parsing)
                return null;
              } else if (paragraph.trim() === "") {
                return null;
              } else if (paragraph.startsWith("- ")) {
                return (
                  <li key={index} style={{ marginLeft: "2rem" }}>
                    {paragraph.replace("- ", "")}
                  </li>
                );
              } else if (/^\d+\./.test(paragraph)) {
                return (
                  <li
                    key={index}
                    style={{ marginLeft: "2rem", listStyleType: "decimal" }}
                  >
                    {paragraph.replace(/^\d+\.\s*/, "")}
                  </li>
                );
              } else {
                return <p key={index}>{paragraph}</p>;
              }
            })}
          </div>

          <footer className={styles.articleFooter}>
            <Link href="/blog" className={styles.backButton}>
              <ArrowLeft size={20} />
              Back to All Articles
            </Link>
            <div className={styles.shareText}>
              Share this article with your family
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}
