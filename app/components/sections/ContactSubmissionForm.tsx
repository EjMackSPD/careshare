"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import styles from "./SectionRenderer.module.css";
import type { InquiryType } from "./section-types";

type ContactSubmissionFormProps = {
  inquiryTypes?: InquiryType[];
};

const defaultInquiryTypes: InquiryType[] = [
  { label: "General Question", value: "general" },
  { label: "Technical Support", value: "support" },
  { label: "Partnership Opportunity", value: "partnership" },
  { label: "Press & Media", value: "press" },
  { label: "Product Feedback", value: "feedback" },
];

export default function ContactSubmissionForm({
  inquiryTypes = defaultInquiryTypes,
}: ContactSubmissionFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    type: inquiryTypes[0]?.value ?? "general",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const response = await fetch("/api/contact-submissions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      type: inquiryTypes[0]?.value ?? "general",
    });
    setStatus("sent");
  }

  return (
    <form onSubmit={handleSubmit} className={styles.contactForm}>
      <div className={styles.formField}>
        <label htmlFor="contact-name">Your Name *</label>
        <input
          id="contact-name"
          type="text"
          value={formData.name}
          onChange={(event) => setFormData({ ...formData, name: event.target.value })}
          required
          placeholder="John Doe"
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="contact-email">Email Address *</label>
        <input
          id="contact-email"
          type="email"
          value={formData.email}
          onChange={(event) => setFormData({ ...formData, email: event.target.value })}
          required
          placeholder="john@example.com"
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="contact-type">I'm inquiring about *</label>
        <select
          id="contact-type"
          value={formData.type}
          onChange={(event) => setFormData({ ...formData, type: event.target.value })}
          required
        >
          {inquiryTypes.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label htmlFor="contact-subject">Subject *</label>
        <input
          id="contact-subject"
          type="text"
          value={formData.subject}
          onChange={(event) => setFormData({ ...formData, subject: event.target.value })}
          required
          placeholder="How can we help?"
        />
      </div>

      <div className={styles.formField}>
        <label htmlFor="contact-message">Message *</label>
        <textarea
          id="contact-message"
          value={formData.message}
          onChange={(event) => setFormData({ ...formData, message: event.target.value })}
          required
          rows={6}
          placeholder="Tell us more about your question or how we can help..."
        />
      </div>

      <button type="submit" className={styles.contactSubmit} disabled={status === "submitting"}>
        <Send size={20} />
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>

      {status === "sent" ? (
        <div className={styles.contactSuccess}>Thank you. We will get back to you soon.</div>
      ) : null}
      {status === "error" ? (
        <div className={styles.contactError}>We could not send that message. Please try again.</div>
      ) : null}
    </form>
  );
}
