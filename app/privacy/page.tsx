"use client";

import Link from "next/link";
import Footer from "../components/Footer";
import MarketingNav from "../components/MarketingNav";
import {
  Shield,
  Lock,
  Eye,
  UserCheck,
  Database,
  AlertCircle,
  Users,
} from "lucide-react";
import styles from "./page.module.css";

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <MarketingNav />

      <main className={styles.main}>
        <div className={styles.hero}>
          <Shield size={64} className={styles.heroIcon} />
          <h1>Privacy Policy</h1>
          <p>Last updated: October 4, 2025</p>
        </div>

        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <h3>Quick Navigation</h3>
            <nav className={styles.tocNav}>
              <a href="#collection">Information We Collect</a>
              <a href="#usage">How We Use Information</a>
              <a href="#sharing">Information Sharing</a>
              <a href="#security">Data Security</a>
              <a href="#rights">Your Rights</a>
              <a href="#cookies">Cookies & Tracking</a>
              <a href="#children">Children's Privacy</a>
              <a href="#changes">Policy Changes</a>
              <a href="#contact">Contact Us</a>
            </nav>
          </aside>

          <article className={styles.article}>
            <div className={styles.intro}>
              <p>
                At CareShare, we take your privacy seriously. This Privacy
                Policy explains how we collect, use, disclose, and safeguard
                your information when you use our platform.
              </p>
            </div>

            <section id="collection">
              <h2>
                <Database size={24} />
                Information We Collect
              </h2>
              <h3>Personal Information</h3>
              <p>
                When you create an account, we collect information such as your
                name, email address, and password. If you choose to provide
                additional information to enhance your experience, we collect
                that as well.
              </p>

              <h3>Family and Care Information</h3>
              <p>
                To facilitate care coordination, we collect information you
                choose to share about family members, care recipients, events,
                appointments, medications, financial arrangements, and
                communications within your family group.
              </p>

              <h3>Usage Data</h3>
              <p>
                We automatically collect certain information about your device
                and how you interact with our platform, including browser type,
                IP address, pages visited, and time spent on pages.
              </p>
            </section>

            <section id="usage">
              <h2>
                <UserCheck size={24} />
                How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information and updates</li>
                <li>
                  Respond to comments, questions, and customer service requests
                </li>
                <li>Send marketing communications (with your consent)</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Personalize your experience on our platform</li>
              </ul>
            </section>

            <section id="sharing">
              <h2>
                <Users size={24} />
                Information Sharing and Disclosure
              </h2>
              <p>
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following limited circumstances:
              </p>

              <h3>Within Your Family Group</h3>
              <p>
                Information you add to a family group is shared with other
                members of that group. You control what information you share.
              </p>

              <h3>Service Providers</h3>
              <p>
                We may share information with trusted third-party service
                providers who assist us in operating our platform, conducting
                our business, or serving our users, as long as those parties
                agree to keep this information confidential.
              </p>

              <h3>Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law or
                in response to valid requests by public authorities.
              </p>
            </section>

            <section id="security">
              <h2>
                <Lock size={24} />
                Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational security
                measures to protect your personal information, including:
              </p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Strict access controls and authentication</li>
                <li>Secure data centers with redundant backups</li>
                <li>Employee training on data protection</li>
              </ul>
              <div className={styles.note}>
                <AlertCircle size={20} />
                <p>
                  While we strive to protect your information, no method of
                  transmission over the internet or electronic storage is 100%
                  secure. We cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section id="rights">
              <h2>
                <Eye size={24} />
                Your Privacy Rights
              </h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Delete your account and associated data</li>
                <li>Object to or restrict certain processing activities</li>
                <li>
                  Data portability (receive your data in a structured format)
                </li>
                <li>Withdraw consent at any time</li>
                <li>Opt out of marketing communications</li>
              </ul>
              <p>
                To exercise these rights, please contact us at{" "}
                <a href="mailto:privacy@careshare.app">privacy@careshare.app</a>
              </p>
            </section>

            <section id="cookies">
              <h2>Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to track
                activity on our platform and hold certain information. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent.
              </p>
            </section>

            <section id="children">
              <h2>Children's Privacy</h2>
              <p>
                Our service is not directed to children under 13. We do not
                knowingly collect personally identifiable information from
                children under 13. If you become aware that a child has provided
                us with personal information, please contact us.
              </p>
            </section>

            <section id="changes">
              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date.
              </p>
            </section>

            <section id="contact">
              <h2>Contact Us About Privacy</h2>
              <p>
                If you have questions or concerns about this Privacy Policy,
                please contact us at:
              </p>
              <div className={styles.contactBox}>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:privacy@careshare.app">
                    privacy@careshare.app
                  </a>
                </p>
                <p>
                  <strong>Mail:</strong> CareShare Privacy Team, 123 Care
                  Street, San Francisco, CA 94102
                </p>
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
