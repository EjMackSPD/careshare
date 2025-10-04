"use client";

import Link from "next/link";
import Footer from "../components/Footer";
import MarketingNav from "../components/MarketingNav";
import {
  Wallet,
  Calendar,
  Users,
  MessageSquare,
  Heart,
  FileText,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Zap,
  Sparkles,
  Target,
  BarChart3,
  Bell,
  Video,
} from "lucide-react";
import styles from "./page.module.css";

export default function Features() {
  return (
    <div className={styles.container}>
      <MarketingNav />

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Sparkles size={16} />
              All-in-One Caregiving Platform
            </div>
            <h1>
              Everything Your Family Needs
              <br />
              <span className={styles.heroHighlight}>
                In One Beautiful Place
              </span>
            </h1>
            <p className={styles.heroSubtitle}>
              Stop juggling emails, texts, and spreadsheets. CareShare brings
              everyone together with powerful tools that actually make
              caregiving easier.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/signup" className={styles.heroPrimaryBtn}>
                Start Free Trial
                <Zap size={20} />
              </Link>
              <Link href="/login" className={styles.heroSecondaryBtn}>
                Try Demo
                <Video size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* Core Features Grid */}
        <section className={styles.featuresGrid}>
          <h2 className={styles.sectionTitle}>
            Powerful Features That Make a Difference
          </h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to coordinate care, all in one place
          </p>

          <div className={styles.grid}>
            {/* Financial Management */}
            <div className={styles.featureCard}>
              <div
                className={styles.iconWrapper}
                style={{ background: "#dbeafe" }}
              >
                <Wallet size={32} style={{ color: "#2563eb" }} />
              </div>
              <h3>Smart Financial Tracking</h3>
              <p>
                Say goodbye to awkward money conversations. Track expenses,
                split costs fairly, and keep everyone on the same page
                financially.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <CheckCircle size={18} />
                  Transparent contribution tracking
                </li>
                <li>
                  <CheckCircle size={18} />
                  Automatic bill splitting
                </li>
                <li>
                  <CheckCircle size={18} />
                  Payment reminders
                </li>
                <li>
                  <CheckCircle size={18} />
                  Financial reports & exports
                </li>
              </ul>
            </div>

            {/* Calendar & Events */}
            <div className={styles.featureCard}>
              <div
                className={styles.iconWrapper}
                style={{ background: "#dcfce7" }}
              >
                <Calendar size={32} style={{ color: "#16a34a" }} />
              </div>
              <h3>Shared Family Calendar</h3>
              <p>
                Never miss an appointment, birthday, or important event.
                Everyone stays in sync with real-time updates.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <CheckCircle size={18} />
                  Medical appointments
                </li>
                <li>
                  <CheckCircle size={18} />
                  Family celebrations
                </li>
                <li>
                  <CheckCircle size={18} />
                  Medication schedules
                </li>
                <li>
                  <CheckCircle size={18} />
                  Automatic reminders
                </li>
              </ul>
            </div>

            {/* Task Management */}
            <div className={styles.featureCard}>
              <div
                className={styles.iconWrapper}
                style={{ background: "#fef3c7" }}
              >
                <Target size={32} style={{ color: "#ca8a04" }} />
              </div>
              <h3>Task Coordination</h3>
              <p>
                Divide responsibilities fairly. Assign tasks, set priorities,
                and watch your family work together seamlessly.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <CheckCircle size={18} />
                  Easy task assignment
                </li>
                <li>
                  <CheckCircle size={18} />
                  Priority levels
                </li>
                <li>
                  <CheckCircle size={18} />
                  Progress tracking
                </li>
                <li>
                  <CheckCircle size={18} />
                  Workload balancing
                </li>
              </ul>
            </div>

            {/* Communication */}
            <div className={styles.featureCard}>
              <div
                className={styles.iconWrapper}
                style={{ background: "#e9d5ff" }}
              >
                <MessageSquare size={32} style={{ color: "#7c3aed" }} />
              </div>
              <h3>Family Communication Hub</h3>
              <p>
                Keep conversations organized. Share updates, photos, and
                important information all in one secure place.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <CheckCircle size={18} />
                  Secure family messaging
                </li>
                <li>
                  <CheckCircle size={18} />
                  Photo sharing
                </li>
                <li>
                  <CheckCircle size={18} />
                  Update notifications
                </li>
                <li>
                  <CheckCircle size={18} />
                  No more group texts
                </li>
              </ul>
            </div>

            {/* Care Planning */}
            <div className={styles.featureCard}>
              <div
                className={styles.iconWrapper}
                style={{ background: "#fecaca" }}
              >
                <Heart size={32} style={{ color: "#dc2626" }} />
              </div>
              <h3>Comprehensive Care Planning</h3>
              <p>
                Document care preferences, emergency contacts, and important
                information. Be prepared for any situation.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <CheckCircle size={18} />
                  Care level tracking
                </li>
                <li>
                  <CheckCircle size={18} />
                  Emergency scenarios
                </li>
                <li>
                  <CheckCircle size={18} />
                  Medical history
                </li>
                <li>
                  <CheckCircle size={18} />
                  Important documents
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div className={styles.featureCard}>
              <div
                className={styles.iconWrapper}
                style={{ background: "#fed7aa" }}
              >
                <FileText size={32} style={{ color: "#ea580c" }} />
              </div>
              <h3>Resource Library</h3>
              <p>
                Access curated resources, guides, and support services. Find
                help when you need it most.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <CheckCircle size={18} />
                  Healthcare providers
                </li>
                <li>
                  <CheckCircle size={18} />
                  Legal services
                </li>
                <li>
                  <CheckCircle size={18} />
                  Financial advisors
                </li>
                <li>
                  <CheckCircle size={18} />
                  Support groups
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className={styles.advancedSection}>
          <h2 className={styles.sectionTitle}>Built for Real Families</h2>
          <p className={styles.sectionSubtitle}>
            Every feature designed with caregivers in mind
          </p>

          <div className={styles.advancedGrid}>
            <div className={styles.advancedFeature}>
              <div className={styles.advancedIcon}>
                <BarChart3 size={24} />
              </div>
              <h4>Expense Analytics</h4>
              <p>
                Visualize spending trends and budget better for future care
                needs.
              </p>
            </div>

            <div className={styles.advancedFeature}>
              <div className={styles.advancedIcon}>
                <Bell size={24} />
              </div>
              <h4>Smart Notifications</h4>
              <p>
                Get alerted about bills, appointments, and important updates.
              </p>
            </div>

            <div className={styles.advancedFeature}>
              <div className={styles.advancedIcon}>
                <Users size={24} />
              </div>
              <h4>Role Management</h4>
              <p>
                Control access with care manager, family member, and contributor
                roles.
              </p>
            </div>

            <div className={styles.advancedFeature}>
              <div className={styles.advancedIcon}>
                <Shield size={24} />
              </div>
              <h4>Bank-Level Security</h4>
              <p>
                Your family's data is encrypted and protected with enterprise
                security.
              </p>
            </div>

            <div className={styles.advancedFeature}>
              <div className={styles.advancedIcon}>
                <Clock size={24} />
              </div>
              <h4>24/7 Access</h4>
              <p>Access from anywhere, anytime. Mobile apps coming soon.</p>
            </div>

            <div className={styles.advancedFeature}>
              <div className={styles.advancedIcon}>
                <TrendingUp size={24} />
              </div>
              <h4>Contribution Reports</h4>
              <p>Download detailed reports of who contributed what and when.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.howItWorks}>
          <h2 className={styles.sectionTitle}>Getting Started is Easy</h2>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3>Create Your Family</h3>
              <p>
                Set up your family group in minutes. Add a name, description,
                and invite family members.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3>Invite Family Members</h3>
              <p>
                Send invitations via email. Family members can join with one
                click—no complicated setup required.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <h3>Start Coordinating</h3>
              <p>
                Add events, create tasks, track expenses, and communicate. Watch
                your family work together like never before.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Transform Family Caregiving?</h2>
            <p>Join thousands of families who are caring better, together.</p>
            <div className={styles.ctaButtons}>
              <Link href="/signup" className={styles.ctaPrimaryBtn}>
                Get Started Free
                <Sparkles size={20} />
              </Link>
              <Link href="/login" className={styles.ctaSecondaryBtn}>
                Try Demo Account
              </Link>
            </div>
            <p className={styles.ctaNote}>
              ✓ No credit card required &nbsp;•&nbsp; ✓ 14-day free trial
              &nbsp;•&nbsp; ✓ Cancel anytime
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
