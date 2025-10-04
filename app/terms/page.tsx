"use client";

import Link from "next/link";
import Footer from "../components/Footer";
import MarketingNav from "../components/MarketingNav";
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Scale,
} from "lucide-react";
import styles from "../privacy/page.module.css";

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <MarketingNav />

      <main className={styles.main}>
        <div className={styles.hero}>
          <Scale size={64} className={styles.heroIcon} />
          <h1>Terms of Service</h1>
          <p>Last updated: October 4, 2025</p>
        </div>

        <div className={styles.content}>
          <aside className={styles.sidebar}>
            <h3>Quick Navigation</h3>
            <nav className={styles.tocNav}>
              <a href="#agreement">Agreement to Terms</a>
              <a href="#accounts">User Accounts</a>
              <a href="#acceptable">Acceptable Use</a>
              <a href="#content">Content & Ownership</a>
              <a href="#subscriptions">Subscriptions & Billing</a>
              <a href="#termination">Termination</a>
              <a href="#disclaimers">Disclaimers</a>
              <a href="#liability">Limitation of Liability</a>
              <a href="#governing">Governing Law</a>
              <a href="#contact">Contact</a>
            </nav>
          </aside>

          <article className={styles.article}>
            <div className={styles.intro}>
              <p>
                These Terms of Service ("Terms") govern your access to and use
                of CareShare's platform and services. By accessing or using
                CareShare, you agree to be bound by these Terms.
              </p>
            </div>

            <section id="agreement">
              <h2>
                <FileText size={24} />
                Agreement to Terms
              </h2>
              <p>
                By creating an account or using CareShare, you agree to these
                Terms and our Privacy Policy. If you don't agree to these Terms,
                please don't use our platform.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. We will
                notify you of any material changes via email or through the
                platform.
              </p>
            </section>

            <section id="accounts">
              <h2>
                <CheckCircle size={24} />
                User Accounts
              </h2>
              <h3>Account Creation</h3>
              <p>
                To use CareShare, you must create an account. You agree to
                provide accurate, current, and complete information during
                registration and to update it as necessary.
              </p>

              <h3>Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials and for all activities that occur under your
                account. Notify us immediately of any unauthorized use.
              </p>

              <h3>Age Requirements</h3>
              <p>
                You must be at least 18 years old to create an account and use
                CareShare.
              </p>
            </section>

            <section id="acceptable">
              <h2>
                <CheckCircle size={24} />
                Acceptable Use Policy
              </h2>
              <p>When using CareShare, you agree NOT to:</p>
              <ul>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Upload malicious code, viruses, or harmful software</li>
                <li>Harass, abuse, or harm other users</li>
                <li>
                  Use the platform for any unauthorized commercial purpose
                </li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Impersonate any person or entity</li>
                <li>Collect or store personal data of other users</li>
              </ul>
            </section>

            <section id="content">
              <h2>
                <FileText size={24} />
                Content and Intellectual Property
              </h2>
              <h3>Your Content</h3>
              <p>
                You retain ownership of any content you post to CareShare. By
                posting content, you grant us a license to use, store, and
                display that content as necessary to provide our services.
              </p>

              <h3>Our Content</h3>
              <p>
                CareShare and its original content, features, and functionality
                are owned by CareShare Inc. and are protected by international
                copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section id="subscriptions">
              <h2>
                <CheckCircle size={24} />
                Subscriptions and Billing
              </h2>
              <h3>Free Trial</h3>
              <p>
                We offer a 14-day free trial. You can cancel anytime during the
                trial without being charged.
              </p>

              <h3>Paid Subscriptions</h3>
              <p>
                After your trial, your subscription will automatically renew
                unless you cancel. You'll be charged the subscription fee at the
                beginning of each billing period.
              </p>

              <h3>Cancellation</h3>
              <p>
                You can cancel your subscription at any time from your account
                settings. Cancellation takes effect at the end of your current
                billing period.
              </p>

              <h3>Refunds</h3>
              <p>
                We offer refunds on a case-by-case basis. Contact our support
                team to request a refund.
              </p>
            </section>

            <section id="termination">
              <h2>
                <XCircle size={24} />
                Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your account if you
                violate these Terms or engage in conduct that we deem harmful to
                other users or to CareShare.
              </p>
              <p>
                Upon termination, your right to use CareShare will immediately
                cease. We may delete your account and data in accordance with
                our data retention policies.
              </p>
            </section>

            <section id="disclaimers">
              <h2>
                <AlertTriangle size={24} />
                Disclaimers
              </h2>
              <div className={styles.note}>
                <AlertTriangle size={20} />
                <div>
                  <p style={{ marginBottom: "0.75rem" }}>
                    <strong>Important:</strong> CareShare is a coordination
                    tool, not a healthcare provider.
                  </p>
                  <p>
                    Our platform is provided "AS IS" without warranties of any
                    kind. We do not provide medical, legal, or financial advice.
                    Always consult with qualified professionals for such
                    matters.
                  </p>
                </div>
              </div>
            </section>

            <section id="liability">
              <h2>
                <Scale size={24} />
                Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, CareShare shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages resulting from your use or inability to use the
                platform.
              </p>
              <p>
                Our total liability for any claims arising from or related to
                these Terms or our services shall not exceed the amount you paid
                us in the 12 months preceding the claim.
              </p>
            </section>

            <section id="governing">
              <h2>
                <Scale size={24} />
                Governing Law
              </h2>
              <p>
                These Terms are governed by the laws of the State of California,
                without regard to its conflict of law provisions. Any disputes
                will be resolved in the courts of San Francisco County,
                California.
              </p>
            </section>

            <section id="contact">
              <h2>Questions About Terms?</h2>
              <p>
                If you have questions about these Terms of Service, please
                contact us:
              </p>
              <div className={styles.contactBox}>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:legal@careshare.app">legal@careshare.app</a>
                </p>
                <p>
                  <strong>Mail:</strong> CareShare Legal Team, 123 Care Street,
                  San Francisco, CA 94102
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
