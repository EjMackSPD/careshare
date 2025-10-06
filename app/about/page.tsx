"use client";

import Link from "next/link";
import Footer from "../components/Footer";
import MarketingNav from "../components/MarketingNav";
import { Heart, Users, Target, Sparkles, Award, Globe } from "lucide-react";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <MarketingNav />

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <h1>Our Mission: Making Caregiving a Shared Journey</h1>
          <p className={styles.heroSubtitle}>
            We believe that caring for loved ones shouldn't fall on one person's
            shoulders. CareShare was built to help families coordinate care
            together, with transparency, compassion, and ease.
          </p>
        </section>

        {/* Story */}
        <section className={styles.story}>
          <h2>Our Story</h2>
          <div className={styles.storyContent}>
            <p>
              CareShare was born from a personal experience that millions of
              families face. When our founder's grandmother needed increasing
              levels of care, her family—scattered across three states—struggled
              to coordinate effectively.
            </p>
            <p>
              Emails got lost. Phone calls were missed. Financial contributions
              became a source of confusion and tension. Most painfully, family
              members wanted to help but didn't know how, or felt left out of
              important decisions.
            </p>
            <p>
              We knew there had to be a better way. A way that brought families
              together instead of driving them apart. A way that made the burden
              lighter by sharing it among those who care most.
            </p>
            <p>
              That's why we built CareShare—not as another healthcare app, but
              as a family coordination platform that treats caregiving as what
              it truly is: a collaborative act of love.
            </p>
          </div>
        </section>

        {/* Mission & Values */}
        <section className={styles.values}>
          <h2 className={styles.sectionTitle}>What We Stand For</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div
                className={styles.valueIcon}
                style={{ background: "#dbeafe" }}
              >
                <Heart size={40} style={{ color: "#2563eb" }} />
              </div>
              <h3>Family First</h3>
              <p>
                Every feature we build starts with one question: "Does this make
                life easier for families?" If the answer isn't a resounding yes,
                we don't ship it.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div
                className={styles.valueIcon}
                style={{ background: "#dcfce7" }}
              >
                <Users size={40} style={{ color: "#16a34a" }} />
              </div>
              <h3>Shared Responsibility</h3>
              <p>
                Caregiving is a team sport. We design tools that distribute the
                load fairly and help every family member contribute in their own
                way.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div
                className={styles.valueIcon}
                style={{ background: "#fef3c7" }}
              >
                <Sparkles size={40} style={{ color: "#ca8a04" }} />
              </div>
              <h3>Simplicity & Transparency</h3>
              <p>
                Complex situations require simple tools. We believe in clear
                communication, transparent finances, and interfaces that anyone
                can use.
              </p>
            </div>

            <div className={styles.valueCard}>
              <div
                className={styles.valueIcon}
                style={{ background: "#e9d5ff" }}
              >
                <Target size={40} style={{ color: "#7c3aed" }} />
              </div>
              <h3>Purpose-Driven</h3>
              <p>
                We're not just building software—we're supporting families
                during one of life's most challenging journeys. That
                responsibility guides everything we do.
              </p>
            </div>
          </div>
        </section>

        {/* Impact */}
        <section className={styles.impact}>
          <h2 className={styles.sectionTitle}>Our Impact</h2>
          <p className={styles.sectionSubtitle}>
            Every day, we help families care better, together
          </p>
          <div className={styles.impactGrid}>
            <div className={styles.impactStat}>
              <div className={styles.statNumber}>10,000+</div>
              <div className={styles.statLabel}>Families Using CareShare</div>
            </div>
            <div className={styles.impactStat}>
              <div className={styles.statNumber}>$2.5M+</div>
              <div className={styles.statLabel}>In Coordinated Care Costs</div>
            </div>
            <div className={styles.impactStat}>
              <div className={styles.statNumber}>50K+</div>
              <div className={styles.statLabel}>Tasks Completed Together</div>
            </div>
            <div className={styles.impactStat}>
              <div className={styles.statNumber}>98%</div>
              <div className={styles.statLabel}>Family Satisfaction Rate</div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className={styles.team}>
          <h2 className={styles.sectionTitle}>
            Built by Caregivers, for Caregivers
          </h2>
          <p className={styles.sectionSubtitle}>
            Our team has lived the challenges we're solving
          </p>
          <div className={styles.teamNote}>
            <Award size={32} />
            <p>
              Our founding team includes family caregivers, healthcare
              professionals, and technologists who understand both the emotional
              and practical challenges of coordinating care. We're not building
              from theory—we're building from experience.
            </p>
          </div>
        </section>

        {/* Vision */}
        <section className={styles.vision}>
          <div className={styles.visionContent}>
            <Globe size={64} className={styles.visionIcon} />
            <h2>Our Vision</h2>
            <p>
              We envision a world where families feel supported, not
              overwhelmed, when caring for their loved ones. Where geographic
              distance doesn't mean emotional distance. Where financial
              transparency builds trust instead of resentment. Where every
              family member can contribute in meaningful ways.
            </p>
            <p>
              CareShare is just the beginning. We're committed to continuously
              evolving our platform based on the real needs of real families,
              because caregiving deserves tools that actually help.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2>Join Us in Transforming Caregiving</h2>
          <p>
            Whether you're a family caregiver, a care provider, or someone who
            believes in our mission, we'd love to have you be part of the
            CareShare community.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/onboarding" className={styles.ctaPrimaryBtn}>
              Start Your Family Group
            </Link>
            <Link href="/partnerships" className={styles.ctaSecondaryBtn}>
              Become a Partner
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
