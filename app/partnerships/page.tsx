"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "../components/Footer";
import {
  Building2,
  Heart,
  Users,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Mail,
  Calendar,
} from "lucide-react";
import styles from "./page.module.css";
import homeStyles from "../page.module.css";

export default function PartnershipsPage() {
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
            <Link href="/login">Login</Link>
            <Link href="/signup" className={homeStyles.signupBtn}>
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Partner with CareShare</h1>
            <p className={styles.heroSubtitle}>
              Join us in transforming family caregiving. Together, we can help
              millions of families coordinate better care for their loved ones.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.primaryBtn}>
                <Mail size={20} />
                Get in Touch
              </button>
              <button className={styles.secondaryBtn}>
                <Calendar size={20} />
                Schedule a Demo
              </button>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>10,000+</div>
              <div className={styles.statLabel}>Families Served</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>250+</div>
              <div className={styles.statLabel}>Partner Organizations</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>98%</div>
              <div className={styles.statLabel}>Satisfaction Rate</div>
            </div>
          </div>
        </section>

        {/* Why Partner Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Partner with CareShare?</h2>
          <p className={styles.sectionSubtitle}>
            We're building the future of family caregiving coordination
          </p>

          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{ background: "#dbeafe" }}>
                <TrendingUp size={32} style={{ color: "#2563eb" }} />
              </div>
              <h3>Growing Market</h3>
              <p>
                Over 53 million Americans are family caregivers. The market for
                caregiving support is expanding rapidly as the population ages.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{ background: "#dcfce7" }}>
                <Heart size={32} style={{ color: "#16a34a" }} />
              </div>
              <h3>Meaningful Impact</h3>
              <p>
                Help families stay connected and organized during challenging
                times. Your partnership directly improves quality of life.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{ background: "#fef3c7" }}>
                <Shield size={32} style={{ color: "#ca8a04" }} />
              </div>
              <h3>Trusted Platform</h3>
              <p>
                Built with security and privacy first. HIPAA-compliant
                infrastructure and enterprise-grade data protection.
              </p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon} style={{ background: "#e9d5ff" }}>
                <Zap size={32} style={{ color: "#7c3aed" }} />
              </div>
              <h3>Easy Integration</h3>
              <p>
                Simple onboarding process and white-label options available.
                We handle the technology, you focus on care.
              </p>
            </div>
          </div>
        </section>

        {/* Partnership Types */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Partnership Opportunities</h2>

          <div className={styles.partnershipTypes}>
            {/* Senior Living Communities */}
            <div className={styles.partnershipCard}>
              <div className={styles.partnershipHeader}>
                <div
                  className={styles.partnershipIcon}
                  style={{ background: "#dbeafe" }}
                >
                  <Building2 size={40} style={{ color: "#2563eb" }} />
                </div>
                <div>
                  <h3>Senior Living Communities</h3>
                  <p className={styles.partnershipSubtitle}>
                    Nursing Homes, Assisted Living, Memory Care
                  </p>
                </div>
              </div>
              <div className={styles.partnershipContent}>
                <p>
                  Enhance family engagement and communication with a dedicated
                  platform for coordinating care, sharing updates, and managing
                  costs.
                </p>
                <ul className={styles.featureList}>
                  <li>
                    <CheckCircle size={20} />
                    White-label solution for your facility
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Family portal for transparency
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Billing and payment coordination
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Event and care plan sharing
                  </li>
                </ul>
                <button className={styles.partnershipBtn}>
                  Learn More
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Healthcare Providers */}
            <div className={styles.partnershipCard}>
              <div className={styles.partnershipHeader}>
                <div
                  className={styles.partnershipIcon}
                  style={{ background: "#dcfce7" }}
                >
                  <Heart size={40} style={{ color: "#16a34a" }} />
                </div>
                <div>
                  <h3>Healthcare Providers</h3>
                  <p className={styles.partnershipSubtitle}>
                    Hospitals, Clinics, Home Health Agencies
                  </p>
                </div>
              </div>
              <div className={styles.partnershipContent}>
                <p>
                  Improve care coordination and patient outcomes by connecting
                  families with a comprehensive caregiving platform.
                </p>
                <ul className={styles.featureList}>
                  <li>
                    <CheckCircle size={20} />
                    Streamlined discharge planning
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Family communication tools
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Care team collaboration
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Medication management support
                  </li>
                </ul>
                <button className={styles.partnershipBtn}>
                  Learn More
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Technology Partners */}
            <div className={styles.partnershipCard}>
              <div className={styles.partnershipHeader}>
                <div
                  className={styles.partnershipIcon}
                  style={{ background: "#e9d5ff" }}
                >
                  <Zap size={40} style={{ color: "#7c3aed" }} />
                </div>
                <div>
                  <h3>Technology Partners</h3>
                  <p className={styles.partnershipSubtitle}>
                    Healthcare Tech, Integration Services
                  </p>
                </div>
              </div>
              <div className={styles.partnershipContent}>
                <p>
                  Build integrations and expand the CareShare ecosystem with
                  complementary services and technologies.
                </p>
                <ul className={styles.featureList}>
                  <li>
                    <CheckCircle size={20} />
                    API access and documentation
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Co-marketing opportunities
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Revenue sharing models
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Technical support and collaboration
                  </li>
                </ul>
                <button className={styles.partnershipBtn}>
                  Learn More
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Community Organizations */}
            <div className={styles.partnershipCard}>
              <div className={styles.partnershipHeader}>
                <div
                  className={styles.partnershipIcon}
                  style={{ background: "#fef3c7" }}
                >
                  <Users size={40} style={{ color: "#ca8a04" }} />
                </div>
                <div>
                  <h3>Community Organizations</h3>
                  <p className={styles.partnershipSubtitle}>
                    Non-Profits, Support Groups, Advocacy Groups
                  </p>
                </div>
              </div>
              <div className={styles.partnershipContent}>
                <p>
                  Empower your community with tools to support family
                  caregivers and enhance your mission impact.
                </p>
                <ul className={styles.featureList}>
                  <li>
                    <CheckCircle size={20} />
                    Discounted rates for members
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Educational resources
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Community engagement tools
                  </li>
                  <li>
                    <CheckCircle size={20} />
                    Impact measurement and reporting
                  </li>
                </ul>
                <button className={styles.partnershipBtn}>
                  Learn More
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className={styles.section} style={{ background: "#f8fafc" }}>
          <h2 className={styles.sectionTitle}>Partner Success Stories</h2>
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.quote}>"</div>
              <p className={styles.testimonialText}>
                "CareShare has revolutionized how we engage with families. The
                transparency and communication tools have significantly improved
                family satisfaction scores."
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  <Building2 size={24} />
                </div>
                <div>
                  <div className={styles.authorName}>Sunrise Senior Living</div>
                  <div className={styles.authorTitle}>
                    Director of Family Relations
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.quote}>"</div>
              <p className={styles.testimonialText}>
                "The integration was seamless, and our families love having a
                central place to coordinate care. It's become an essential part
                of our care transition process."
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  <Heart size={24} />
                </div>
                <div>
                  <div className={styles.authorName}>Metro Health Network</div>
                  <div className={styles.authorTitle}>
                    Chief Nursing Officer
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <div className={styles.quote}>"</div>
              <p className={styles.testimonialText}>
                "Our members consistently report that CareShare has reduced
                their stress and improved family communication. It's a
                game-changer for caregivers."
              </p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>
                  <Users size={24} />
                </div>
                <div>
                  <div className={styles.authorName}>
                    National Family Caregivers Association
                  </div>
                  <div className={styles.authorTitle}>Executive Director</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Partnership Benefits</h2>
          <div className={styles.benefitsColumns}>
            <div className={styles.benefitColumn}>
              <h3>For Your Organization</h3>
              <ul className={styles.benefitsList}>
                <li>Enhance family engagement and satisfaction</li>
                <li>Improve care coordination and communication</li>
                <li>Differentiate from competitors</li>
                <li>Streamline administrative processes</li>
                <li>Access to usage analytics and insights</li>
                <li>Dedicated account management</li>
              </ul>
            </div>
            <div className={styles.benefitColumn}>
              <h3>For Families</h3>
              <ul className={styles.benefitsList}>
                <li>One place for all care coordination</li>
                <li>Transparent financial tracking</li>
                <li>Easy communication with care teams</li>
                <li>Task and event management</li>
                <li>Document storage and sharing</li>
                <li>Mobile access from anywhere</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to Partner?</h2>
            <p>
              Let's discuss how CareShare can benefit your organization and the
              families you serve.
            </p>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaPrimaryBtn}>
                <Mail size={20} />
                Contact Partnerships Team
              </button>
              <button className={styles.ctaSecondaryBtn}>
                <Calendar size={20} />
                Schedule a Call
              </button>
            </div>
          </div>
          <div className={styles.ctaContact}>
            <h3>Partnership Inquiries</h3>
            <p>
              <strong>Email:</strong>{" "}
              <a href="mailto:partnerships@careshare.app">
                partnerships@careshare.app
              </a>
            </p>
            <p>
              <strong>Phone:</strong> <a href="tel:+18005551234">(800) 555-1234</a>
            </p>
            <p>
              <strong>Hours:</strong> Monday - Friday, 9AM - 5PM EST
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

