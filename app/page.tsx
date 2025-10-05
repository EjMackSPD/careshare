"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import ImageCarousel from "./components/ImageCarousel";
import Footer from "./components/Footer";
import MarketingNav from "./components/MarketingNav";
import {
  Wallet,
  CalendarDays,
  Users,
  Building2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  coverImage: string | null;
  readTime: number;
  category: string;
};

export default function Home() {
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        const res = await fetch("/api/blog?limit=3");
        if (res.ok) {
          const data = await res.json();
          setLatestPosts(data);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      }
    }
    fetchLatestPosts();
  }, []);

  return (
    <main className={styles.main}>
      <MarketingNav />

      <section className={styles.hero}>
        <ImageCarousel />
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Caring for loved ones, <span>together</span>
          </h1>
          <p className={styles.heroSubtitle}>
            CareShare helps families coordinate care for elderly relatives.
            Share costs, organize events, and manage responsibilities—all in one
            place.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/signup" className={styles.primaryBtn}>
              Get Started Free
            </Link>
            <Link href="/demo" className={styles.secondaryBtn}>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.benefits}>
        <h2 className={styles.sectionTitle}>Why CareShare?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Wallet size={48} strokeWidth={1.5} />
            </div>
            <h3>Split Costs Fairly</h3>
            <p>
              Track expenses and contributions transparently. No more awkward
              money conversations.
            </p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <CalendarDays size={48} strokeWidth={1.5} />
            </div>
            <h3>Coordinate Events</h3>
            <p>
              Plan birthdays, appointments, and food deliveries together.
              Everyone stays in the loop.
            </p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Users size={48} strokeWidth={1.5} />
            </div>
            <h3>Bring Family Together</h3>
            <p>
              Share the responsibility of care. Everyone contributes in their
              own way.
            </p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Building2 size={48} strokeWidth={1.5} />
            </div>
            <h3>For Care Providers</h3>
            <p>
              Nursing homes can offer CareShare to help families stay organized
              and engaged.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.demoCta}>
        <div className={styles.demoContent}>
          <div className={styles.demoText}>
            <h2>See CareShare in Action</h2>
            <p>
              Experience the platform with a fully interactive demo account. No
              signup required!
            </p>
            <ul className={styles.demoFeatures}>
              <li>✓ Pre-loaded with realistic caregiving scenarios</li>
              <li>✓ Explore all features and functionality</li>
              <li>✓ See how families coordinate care together</li>
              <li>✓ Test task management, calendars, and finances</li>
            </ul>
          </div>
          <div className={styles.demoAction}>
            <Link href="/login" className={styles.demoBtn}>
              🎭 Try Demo Walkthrough
            </Link>
            <p className={styles.demoNote}>
              Click "Try Demo Mode" on the login page
            </p>
          </div>
        </div>
      </section>

      {/* Latest Blog Articles */}
      {latestPosts.length > 0 && (
        <section className={styles.blogSection}>
          <div className={styles.blogHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                <BookOpen size={32} />
                Latest from Our Blog
              </h2>
              <p className={styles.blogSubtitle}>
                Expert advice and insights for family caregivers
              </p>
            </div>
            <Link href="/blog" className={styles.viewAllBtn}>
              View All Articles
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className={styles.blogGrid}>
            {latestPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={styles.blogCard}
              >
                {post.coverImage && (
                  <div className={styles.blogCardImage}>
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div className={styles.blogCardContent}>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className={styles.blogCardMeta}>
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.readTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.cta}>
        <h2>Ready to get started?</h2>
        <p>Join families who are caring better, together.</p>
        <Link href="/signup" className={styles.primaryBtn}>
          Create Your Family Group
        </Link>
      </section>

      <Footer />
    </main>
  );
}
