"use client";

import { useState } from "react";
import Link from "next/link";
import Footer from "../components/Footer";
import MarketingNav from "../components/MarketingNav";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";
import styles from "./page.module.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: "general",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        type: "general",
      });
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <MarketingNav />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <MessageSquare size={64} className={styles.heroIcon} />
          <h1>Get in Touch</h1>
          <p>
            Have questions? We're here to help. Reach out and we'll get back to
            you as soon as possible.
          </p>
        </section>

        <div className={styles.content}>
          {/* Contact Form */}
          <div className={styles.formSection}>
            <h2>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Your Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  placeholder="john@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>I'm inquiring about *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                >
                  <option value="general">General Question</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="press">Press & Media</option>
                  <option value="feedback">Product Feedback</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                  placeholder="How can we help?"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  rows={6}
                  placeholder="Tell us more about your question or how we can help..."
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                <Send size={20} />
                {submitted ? "Message Sent!" : "Send Message"}
              </button>

              {submitted && (
                <div className={styles.successMessage}>
                  ✓ Thank you! We'll get back to you within 24 hours.
                </div>
              )}
            </form>
          </div>

          {/* Contact Info */}
          <div className={styles.infoSection}>
            <h2>Other Ways to Reach Us</h2>

            <div className={styles.contactCard}>
              <div
                className={styles.contactIcon}
                style={{ background: "#dbeafe" }}
              >
                <Mail size={28} style={{ color: "#2563eb" }} />
              </div>
              <h3>Email</h3>
              <p>
                <a href="mailto:support@careshare.app">support@careshare.app</a>
              </p>
              <span className={styles.responseTime}>
                Response within 24 hours
              </span>
            </div>

            <div className={styles.contactCard}>
              <div
                className={styles.contactIcon}
                style={{ background: "#dcfce7" }}
              >
                <Phone size={28} style={{ color: "#16a34a" }} />
              </div>
              <h3>Phone</h3>
              <p>
                <a href="tel:+18005551234">(800) 555-1234</a>
              </p>
              <span className={styles.responseTime}>
                Monday - Friday, 9AM - 5PM EST
              </span>
            </div>

            <div className={styles.contactCard}>
              <div
                className={styles.contactIcon}
                style={{ background: "#fef3c7" }}
              >
                <MapPin size={28} style={{ color: "#ca8a04" }} />
              </div>
              <h3>Office</h3>
              <p>
                123 Care Street
                <br />
                San Francisco, CA 94102
              </p>
              <span className={styles.responseTime}>By appointment only</span>
            </div>

            <div className={styles.contactCard}>
              <div
                className={styles.contactIcon}
                style={{ background: "#e9d5ff" }}
              >
                <Clock size={28} style={{ color: "#7c3aed" }} />
              </div>
              <h3>Support Hours</h3>
              <p>
                Monday - Friday: 9AM - 5PM EST
                <br />
                Weekend: Emergency support only
              </p>
              <span className={styles.responseTime}>
                Average response: 2 hours
              </span>
            </div>

            <div className={styles.quickLinks}>
              <h3>Quick Links</h3>
              <div className={styles.linksGrid}>
                <Link href="/blog">Visit Our Blog</Link>
                <Link href="/partnerships">Partnership Inquiries</Link>
                <Link href="/login">Try Demo Account</Link>
                <Link href="/signup">Create Account</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
