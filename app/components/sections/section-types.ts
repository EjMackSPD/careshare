import type { LucideIcon } from "lucide-react";

export type IconValue = LucideIcon | string;

export type CTA = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "accent";
  icon?: IconValue;
};

export type SectionMedia =
  | {
      kind: "carousel";
      images?: Array<{
        src: string;
        alt: string;
      }>;
    }
  | {
      kind: "image";
      src: string;
      alt: string;
    };

export type FeatureItem = {
  title: string;
  body: string;
  icon?: IconValue;
  bullets?: string[];
  accentPreset?:
    | "brandBlue"
    | "careGreen"
    | "warmGold"
    | "familyPurple"
    | "alertRose"
    | "supportOrange"
    | "brandGradient";
};

export type StatItem = {
  value: string;
  label: string;
  description?: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type LegalArticleItem = {
  anchor: string;
  title: string;
  icon?: IconValue;
  body?: string;
  bullets?: string[];
};

export type ContactCard = {
  title: string;
  body: string;
  href?: string;
  icon?: IconValue;
  note?: string;
};

export type InquiryType = {
  label: string;
  value: string;
};

export type PartnershipCard = {
  title: string;
  subtitle?: string;
  body: string;
  icon?: IconValue;
  bullets?: string[];
  actions?: CTA[];
};

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  authorTitle?: string | null;
  coverImage?: string | null;
  readTime?: number | null;
  publishedAt?: string | null;
};

export type PageSection =
  | {
      id?: string;
      type: "hero";
      variant: "marketing" | "app";
      theme?: "light" | "brand";
      eyebrow?: string;
      title: string;
      highlight?: string;
      body?: string;
      actions?: CTA[];
      media?: SectionMedia;
    }
  | {
      id?: string;
      type: "feature-grid";
      title: string;
      intro?: string;
      items: FeatureItem[];
      layout?: "cards" | "compact";
      background?: "plain" | "muted";
    }
  | {
      id?: string;
      type: "stats";
      title?: string;
      intro?: string;
      items: StatItem[];
      variant?: "metrics" | "steps";
      background?: "plain" | "muted";
    }
  | {
      id?: string;
      type: "content";
      title?: string;
      intro?: string;
      prose?: string;
      bullets?: string[];
      actions?: CTA[];
      aside?: {
        title: string;
        body?: string;
        actions?: CTA[];
        note?: string;
      };
      layout?: "centered" | "split";
      background?: "plain" | "muted";
    }
  | {
      id?: string;
      type: "cta";
      title: string;
      body?: string;
      actions: CTA[];
      note?: string;
      theme?: "brand" | "slate";
    }
  | {
      id?: string;
      type: "media";
      src: string;
      alt: string;
      caption?: string;
      layout?: "contained" | "wide";
      background?: "plain" | "muted";
    }
  | {
      id?: string;
      type: "testimonial";
      quote: string;
      author: string;
      role?: string;
    }
  | {
      id?: string;
      type: "faq";
      title: string;
      intro?: string;
      items: FAQItem[];
    }
  | {
      id?: string;
      type: "legal-article";
      title: string;
      lastUpdated?: string;
      intro?: string;
      sections: LegalArticleItem[];
    }
  | {
      id?: string;
      type: "contact-form";
      title: string;
      intro?: string;
      inquiryTypes?: InquiryType[];
      contactCards?: ContactCard[];
    }
  | {
      id?: string;
      type: "partnership-cards";
      title: string;
      intro?: string;
      items: PartnershipCard[];
    }
  | {
      id?: string;
      type: "blog-archive";
      title: string;
      intro?: string;
    };
