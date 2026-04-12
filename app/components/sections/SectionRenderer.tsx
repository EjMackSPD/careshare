import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import ImageCarousel from "@/app/components/ImageCarousel";
import styles from "./SectionRenderer.module.css";
import type { CTA, PageSection } from "./section-types";

type SectionRendererProps = {
  sections: PageSection[];
};

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function renderActions(actions: CTA[] | undefined, tone: "default" | "inverse" = "default") {
  if (!actions?.length) {
    return null;
  }

  return (
    <div className={styles.actionRow}>
      {actions.map((action) => {
        const Icon = action.icon;
        const variant = action.variant ?? "primary";
        const className = cx(
          styles.action,
          variant === "primary" && styles.actionPrimary,
          variant === "secondary" && styles.actionSecondary,
          variant === "accent" && styles.actionAccent,
          tone === "inverse" && variant === "accent" && styles.actionAccent
        );

        return (
          <Link key={`${action.href}-${action.label}`} href={action.href} className={className}>
            {action.label}
            {Icon ? <Icon size={18} /> : null}
          </Link>
        );
      })}
    </div>
  );
}

function SectionShell({
  id,
  labelledBy,
  className,
  innerClassName,
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx(styles.section, className)}>
      <div className={cx(styles.sectionSurface, innerClassName)}>{children}</div>
    </section>
  );
}

function SectionHeader({
  title,
  intro,
  headingId,
}: {
  title?: string;
  intro?: string;
  headingId?: string;
}) {
  if (!title && !intro) {
    return null;
  }

  return (
    <header className={styles.sectionHeader}>
      {title ? (
        <h2 id={headingId} className={styles.sectionTitle}>
          {title}
        </h2>
      ) : null}
      {intro ? <p className={styles.sectionIntro}>{intro}</p> : null}
    </header>
  );
}

function renderSection(section: PageSection, index: number) {
  const sectionId = section.id ?? `${section.type}-${index + 1}`;
  const headingId = "title" in section && section.title ? `${sectionId}-title` : undefined;

  switch (section.type) {
    case "hero": {
      const isBrand = section.theme === "brand";
      const heroStyle =
        section.media?.kind === "image"
          ? ({
              ["--hero-image" as string]: `url("${section.media.src}")`,
            } as React.CSSProperties)
          : undefined;

      return (
        <section
          key={sectionId}
          id={sectionId}
          aria-labelledby={headingId}
          className={cx(styles.section, styles.hero, isBrand ? styles.heroBrand : styles.heroLight)}
          style={heroStyle}
        >
          {section.media?.kind === "carousel" ? (
            <>
              <div className={styles.heroCarousel} aria-hidden="true">
                <ImageCarousel />
              </div>
              <div className={styles.heroOverlay} aria-hidden="true" />
            </>
          ) : null}

          <div className={styles.heroContent}>
            {section.eyebrow ? <div className={styles.heroEyebrow}>{section.eyebrow}</div> : null}
            <h1 id={headingId} className={styles.heroTitle}>
              {section.title}
              {section.highlight ? <span className={styles.heroHighlight}>{section.highlight}</span> : null}
            </h1>
            {section.body ? <p className={styles.heroBody}>{section.body}</p> : null}
            {renderActions(section.actions, isBrand ? "inverse" : "default")}
          </div>
        </section>
      );
    }

    case "feature-grid": {
      const compact = section.layout === "compact";

      return (
        <SectionShell
          key={sectionId}
          id={sectionId}
          labelledBy={headingId}
          innerClassName={cx(section.background === "muted" && styles.surfaceMuted)}
        >
          <SectionHeader title={section.title} intro={section.intro} headingId={headingId} />

          <div
            className={cx(
              styles.featureGrid,
              compact ? styles.featureGridCompact : styles.featureGridCards
            )}
          >
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className={cx(styles.featureCard, compact && styles.featureCardCompact)}
                >
                  {Icon ? (
                    <div
                      className={styles.featureIcon}
                      style={{
                        background: item.accent?.background ?? "#dbeafe",
                        color: item.accent?.foreground ?? "#2563eb",
                      }}
                    >
                      <Icon size={32} />
                    </div>
                  ) : null}
                  <h3 className={styles.featureCardTitle}>{item.title}</h3>
                  <p className={styles.featureCardBody}>{item.body}</p>

                  {item.bullets?.length ? (
                    <ul className={styles.bulletList}>
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className={styles.bulletItem}>
                          <CheckCircle2 size={18} className={styles.bulletIcon} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        </SectionShell>
      );
    }

    case "stats": {
      const steps = section.variant === "steps";

      return (
        <SectionShell
          key={sectionId}
          id={sectionId}
          labelledBy={headingId}
          innerClassName={cx(
            section.background === "muted" && styles.surfaceMuted,
            styles.surfaceTight
          )}
        >
          <SectionHeader title={section.title} intro={section.intro} headingId={headingId} />

          <div className={cx(styles.statsGrid, steps ? styles.statsSteps : styles.statsMetrics)}>
            {section.items.map((item) => (
              <article key={`${item.value}-${item.label}`} className={cx(styles.statCard, steps && styles.statStep)}>
                <div className={styles.statValue}>{item.value}</div>
                <h3 className={styles.statLabel}>{item.label}</h3>
                {item.description ? <p className={styles.statDescription}>{item.description}</p> : null}
              </article>
            ))}
          </div>
        </SectionShell>
      );
    }

    case "content": {
      const paragraphs = section.prose
        ? section.prose.split("\n\n").filter(Boolean)
        : [];

      return (
        <SectionShell
          key={sectionId}
          id={sectionId}
          labelledBy={headingId}
          innerClassName={cx(section.background === "muted" && styles.surfaceMuted)}
        >
          <div className={section.layout === "split" ? styles.contentSplit : styles.contentCentered}>
            <div>
              {section.title ? (
                <h2 id={headingId} className={styles.contentTitle}>
                  {section.title}
                </h2>
              ) : null}
              {section.intro ? <p className={styles.contentIntro}>{section.intro}</p> : null}

              {paragraphs.length ? (
                <div className={styles.contentProse}>
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}

              {section.bullets?.length ? (
                <ul className={cx(styles.bulletList, styles.contentProse)}>
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className={styles.bulletItem}>
                      <CheckCircle2 size={18} className={styles.bulletIcon} />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.layout !== "split" ? renderActions(section.actions) : null}
            </div>

            {section.layout === "split" && section.aside ? (
              <aside className={styles.contentAside}>
                <h3 className={styles.contentAsideTitle}>{section.aside.title}</h3>
                {section.aside.body ? <p className={styles.contentAsideBody}>{section.aside.body}</p> : null}
                {renderActions(section.aside.actions ?? section.actions)}
                {section.aside.note ? <p className={styles.contentAsideNote}>{section.aside.note}</p> : null}
              </aside>
            ) : null}
          </div>
        </SectionShell>
      );
    }

    case "cta": {
      const inverse = true;

      return (
        <section
          key={sectionId}
          id={sectionId}
          aria-labelledby={headingId}
          className={cx(styles.section, styles.cta, section.theme === "slate" ? styles.ctaSlate : styles.ctaBrand)}
        >
          <div className={styles.ctaSurface}>
            <div className={styles.ctaInner}>
              <h2 id={headingId} className={styles.ctaTitle}>
                {section.title}
              </h2>
              {section.body ? <p className={styles.ctaBody}>{section.body}</p> : null}
              {renderActions(section.actions, inverse ? "inverse" : "default")}
              {section.note ? <p className={styles.ctaNote}>{section.note}</p> : null}
            </div>
          </div>
        </section>
      );
    }

    case "testimonial":
      return (
        <SectionShell key={sectionId} id={sectionId} innerClassName={styles.surfaceTight}>
          <div className={styles.testimonialCard}>
            <blockquote className={styles.testimonialQuote}>&ldquo;{section.quote}&rdquo;</blockquote>
            <div className={styles.testimonialMeta}>
              <strong>{section.author}</strong>
              {section.role ? <div>{section.role}</div> : null}
            </div>
          </div>
        </SectionShell>
      );

    case "faq":
      return (
        <SectionShell key={sectionId} id={sectionId} labelledBy={headingId}>
          <SectionHeader title={section.title} intro={section.intro} headingId={headingId} />
          <div className={styles.faqList}>
            {section.items.map((item) => (
              <article key={item.question} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{item.question}</h3>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </article>
            ))}
          </div>
        </SectionShell>
      );
  }
}

export default function SectionRenderer({ sections }: SectionRendererProps) {
  return <div className={styles.stack}>{sections.map((section, index) => renderSection(section, index))}</div>;
}
