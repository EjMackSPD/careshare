import type { LucideIcon } from "lucide-react";

export type CTA = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "accent";
  icon?: LucideIcon;
};

export type SectionMedia =
  | {
      kind: "carousel";
    }
  | {
      kind: "image";
      src: string;
      alt: string;
    };

export type FeatureItem = {
  title: string;
  body: string;
  icon?: LucideIcon;
  bullets?: string[];
  accent?: {
    background: string;
    foreground: string;
  };
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
    };
