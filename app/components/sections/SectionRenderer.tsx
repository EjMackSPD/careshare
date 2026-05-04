import Link from "next/link";
import Image from "next/image";
import { Calendar, CheckCircle2, Clock, Tag, User } from "lucide-react";
import ImageCarousel from "@/app/components/ImageCarousel";
import styles from "./SectionRenderer.module.css";
import ContactSubmissionForm from "./ContactSubmissionForm";
import { resolveIcon } from "./icon-map";
import type { BlogListItem, CTA, PageSection } from "./section-types";

type SectionRendererProps = {
  sections: PageSection[];
  posts?: BlogListItem[];
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
  CAREGIVING_TIPS: styles.categoryCaregiving,
  FAMILY_STORIES: styles.categoryStories,
  HEALTH_WELLNESS: styles.categoryHealth,
  FINANCIAL_PLANNING: styles.categoryFinancial,
  TECHNOLOGY: styles.categoryTechnology,
  LEGAL_MATTERS: styles.categoryLegal,
  COMPANY_NEWS: styles.categoryCompany,
};

const featureAccentClasses: Record<string, string> = {
  brandBlue: styles.featureIconBrandBlue,
  careGreen: styles.featureIconCareGreen,
  warmGold: styles.featureIconWarmGold,
  familyPurple: styles.featureIconFamilyPurple,
  alertRose: styles.featureIconAlertRose,
  supportOrange: styles.featureIconSupportOrange,
  brandGradient: styles.featureIconBrandGradient,
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
        const Icon = resolveIcon(action.icon);
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

function renderParagraphs(text: string | undefined, className: string) {
  const paragraphs = text ? text.split("\n\n").filter(Boolean) : [];

  if (!paragraphs.length) {
    return null;
  }

  return (
    <div className={className}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
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

function renderSection(section: PageSection, index: number, posts: BlogListItem[] = []) {
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
                <ImageCarousel images={section.media.images} />
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
              const Icon = resolveIcon(item.icon);

              return (
                <article
                  key={item.title}
                  className={cx(styles.featureCard, compact && styles.featureCardCompact)}
                >
                  {Icon ? (
                    <div
                      className={cx(
                        styles.featureIcon,
                        featureAccentClasses[item.accentPreset ?? "brandBlue"]
                      )}
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

              {renderParagraphs(section.prose, styles.contentProse)}

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

    case "media":
      return (
        <SectionShell
          key={sectionId}
          id={sectionId}
          innerClassName={cx(section.background === "muted" && styles.surfaceMuted)}
        >
          <figure className={cx(styles.mediaBlock, section.layout === "wide" && styles.mediaBlockWide)}>
            <div className={styles.mediaFrame}>
              <Image src={section.src} alt={section.alt} fill sizes="(min-width: 1024px) 1024px, 100vw" />
            </div>
            {section.caption ? <figcaption className={styles.mediaCaption}>{section.caption}</figcaption> : null}
          </figure>
        </SectionShell>
      );

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

    case "legal-article":
      return (
        <SectionShell key={sectionId} id={sectionId} labelledBy={headingId}>
          <div className={styles.legalLayout}>
            <aside className={styles.legalSidebar}>
              <h3>Quick Navigation</h3>
              <nav>
                {section.sections.map((item) => (
                  <a key={item.anchor} href={`#${item.anchor}`}>
                    {item.title}
                  </a>
                ))}
              </nav>
            </aside>

            <article className={styles.legalArticle}>
              <header className={styles.legalHeader}>
                <h1 id={headingId}>{section.title}</h1>
                {section.lastUpdated ? <p>Last updated: {section.lastUpdated}</p> : null}
                {section.intro ? <div className={styles.legalIntro}>{section.intro}</div> : null}
              </header>

              {section.sections.map((item) => {
                const Icon = resolveIcon(item.icon);

                return (
                  <section key={item.anchor} id={item.anchor} className={styles.legalSection}>
                    <h2>
                      {Icon ? <Icon size={24} /> : null}
                      {item.title}
                    </h2>
                    {renderParagraphs(item.body, styles.legalProse)}
                    {item.bullets?.length ? (
                      <ul>
                        {item.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                );
              })}
            </article>
          </div>
        </SectionShell>
      );

    case "contact-form":
      return (
        <SectionShell key={sectionId} id={sectionId} labelledBy={headingId}>
          <SectionHeader title={section.title} intro={section.intro} headingId={headingId} />

          <div className={styles.contactLayout}>
            <ContactSubmissionForm inquiryTypes={section.inquiryTypes} />

            {section.contactCards?.length ? (
              <div className={styles.contactCards}>
                {section.contactCards.map((card) => {
                  const Icon = resolveIcon(card.icon);

                  return (
                    <article key={card.title} className={styles.contactCard}>
                      {Icon ? (
                        <div className={styles.contactCardIcon}>
                          <Icon size={28} />
                        </div>
                      ) : null}
                      <h3>{card.title}</h3>
                      {card.href ? (
                        <SmartLink href={card.href}>
                          {card.body.split("\n").map((line) => (
                            <span key={line}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </SmartLink>
                      ) : (
                        <p>{card.body}</p>
                      )}
                      {card.note ? <span>{card.note}</span> : null}
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </SectionShell>
      );

    case "partnership-cards":
      return (
        <SectionShell key={sectionId} id={sectionId} labelledBy={headingId}>
          <SectionHeader title={section.title} intro={section.intro} headingId={headingId} />

          <div className={styles.partnershipGrid}>
            {section.items.map((item) => {
              const Icon = resolveIcon(item.icon);

              return (
                <article key={item.title} className={styles.partnershipCard}>
                  <header className={styles.partnershipHeader}>
                    {Icon ? (
                      <div className={styles.partnershipIcon}>
                        <Icon size={32} />
                      </div>
                    ) : null}
                    <div>
                      <h3>{item.title}</h3>
                      {item.subtitle ? <p>{item.subtitle}</p> : null}
                    </div>
                  </header>
                  <p className={styles.partnershipBody}>{item.body}</p>
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
                  {renderActions(item.actions)}
                </article>
              );
            })}
          </div>
        </SectionShell>
      );

    case "blog-archive":
      return (
        <SectionShell key={sectionId} id={sectionId} labelledBy={headingId}>
          <SectionHeader title={section.title} intro={section.intro} headingId={headingId} />

          {posts.length ? (
            <div className={styles.blogGrid}>
              {posts.map((post, postIndex) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={cx(styles.blogCard, postIndex === 0 && styles.blogCardFeatured)}
                >
                  {post.coverImage ? (
                    <div className={styles.blogImage}>
                      <Image src={post.coverImage} alt={post.title} fill style={{ objectFit: "cover" }} />
                    </div>
                  ) : null}
                  <div className={styles.blogCardContent}>
                    <span
                      className={cx(
                        styles.blogCategory,
                        categoryColors[post.category] ?? styles.categoryCaregiving
                      )}
                    >
                      <Tag size={14} />
                      {categoryLabels[post.category] ?? post.category}
                    </span>
                    <h3>{post.title}</h3>
                    <p>{post.excerpt}</p>
                    <div className={styles.blogMeta}>
                      <span>
                        <User size={15} />
                        {post.author}
                      </span>
                      {post.publishedAt ? (
                        <span>
                          <Calendar size={15} />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                      {post.readTime ? (
                        <span>
                          <Clock size={15} />
                          {post.readTime} min read
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>No articles found</h3>
              <p>Published posts will appear here once they are added in Payload.</p>
            </div>
          )}
        </SectionShell>
      );
  }
}

export default function SectionRenderer({ sections, posts }: SectionRendererProps) {
  return (
    <div className={styles.stack}>
      {sections.map((section, index) => renderSection(section, index, posts))}
    </div>
  );
}
