import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";
import Footer from "@/app/components/Footer";
import MarketingNav from "@/app/components/MarketingNav";
import {
  getPublishedPostBySlug,
  getRelatedPosts,
  mapPostForList,
  postMetadata,
} from "@/lib/cms";
import styles from "./page.module.css";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const categoryLabels: Record<string, string> = {
  CAREGIVING_TIPS: "Caregiving Tips",
  FAMILY_STORIES: "Family Stories",
  HEALTH_WELLNESS: "Health & Wellness",
  FINANCIAL_PLANNING: "Financial Planning",
  TECHNOLOGY: "Technology",
  LEGAL_MATTERS: "Legal Matters",
  COMPANY_NEWS: "Company News",
};

const categoryColors: Record<string, string> = {
  CAREGIVING_TIPS: "#6366f1",
  FAMILY_STORIES: "#ec4899",
  HEALTH_WELLNESS: "#10b981",
  FINANCIAL_PLANNING: "#f59e0b",
  TECHNOLOGY: "#8b5cf6",
  LEGAL_MATTERS: "#ef4444",
  COMPANY_NEWS: "#06b6d4",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  return postMetadata(await getPublishedPostBySlug(slug));
}

function renderArticleContent(content: string) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("### ")) {
        return <h3 key={line}>{line.replace(/^### /, "")}</h3>;
      }

      if (line.startsWith("## ")) {
        return <h2 key={line}>{line.replace(/^## /, "")}</h2>;
      }

      if (line.startsWith("- ")) {
        return <li key={line}>{line.replace(/^- /, "")}</li>;
      }

      return <p key={line}>{line}</p>;
    });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const listPost = mapPostForList(post);
  const relatedPosts = await getRelatedPosts(post);
  const image = listPost.coverImage;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: image || "https://careshare.vercel.app/careshare-logo.png",
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: post.authorTitle,
    },
    publisher: {
      "@type": "Organization",
      name: "CareShare",
      logo: {
        "@type": "ImageObject",
        url: "https://careshare.vercel.app/careshare-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://careshare.vercel.app/blog/${post.slug}`,
    },
  };

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
              style={{ background: categoryColors[post.category] ?? "#6366f1" }}
            >
              <Tag size={16} />
              {categoryLabels[post.category] ?? post.category}
            </span>
            <h1>{post.title}</h1>
            <p className={styles.excerpt}>{post.excerpt}</p>

            <div className={styles.meta}>
              <div className={styles.author}>
                <div className={styles.authorAvatar}>{post.author?.[0] ?? "C"}</div>
                <div className={styles.authorInfo}>
                  <div className={styles.authorName}>{post.author}</div>
                  {post.authorTitle ? (
                    <div className={styles.authorTitle}>{post.authorTitle}</div>
                  ) : null}
                </div>
              </div>
              <div className={styles.stats}>
                {post.publishedAt ? (
                  <div className={styles.metaItem}>
                    <Calendar size={16} />
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                ) : null}
                {post.readTime ? (
                  <div className={styles.metaItem}>
                    <Clock size={16} />
                    <span>{post.readTime} min read</span>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          {image ? (
            <div className={styles.coverImage}>
              <Image src={image} alt={post.title} width={1200} height={630} />
            </div>
          ) : null}

          <div className={styles.content}>{renderArticleContent(post.content)}</div>
        </article>

        {relatedPosts.length ? (
          <section className={styles.ctaSection}>
            <h3>Keep reading</h3>
            <p>More practical CareShare resources for families and care teams.</p>
            <div className={styles.ctaButtons}>
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className={styles.ctaSecondary}>
                  <User size={18} />
                  {related.title}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
