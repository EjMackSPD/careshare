import type { Block, Field } from "payload";

export const iconOptions = [
  { label: "Arrow Right", value: "arrowRight" },
  { label: "Award", value: "award" },
  { label: "Bar Chart", value: "barChart" },
  { label: "Bell", value: "bell" },
  { label: "Book Open", value: "bookOpen" },
  { label: "Building", value: "building" },
  { label: "Calendar", value: "calendar" },
  { label: "Calendar Days", value: "calendarDays" },
  { label: "Check Circle", value: "checkCircle" },
  { label: "Clock", value: "clock" },
  { label: "Database", value: "database" },
  { label: "Eye", value: "eye" },
  { label: "File Text", value: "fileText" },
  { label: "Globe", value: "globe" },
  { label: "Heart", value: "heart" },
  { label: "Lock", value: "lock" },
  { label: "Mail", value: "mail" },
  { label: "Map Pin", value: "mapPin" },
  { label: "Message Square", value: "messageSquare" },
  { label: "Phone", value: "phone" },
  { label: "Scale", value: "scale" },
  { label: "Send", value: "send" },
  { label: "Shield", value: "shield" },
  { label: "Sparkles", value: "sparkles" },
  { label: "Target", value: "target" },
  { label: "Trending Up", value: "trendingUp" },
  { label: "Users", value: "users" },
  { label: "Video", value: "video" },
  { label: "Wallet", value: "wallet" },
  { label: "Zap", value: "zap" },
];

export const accentPresetOptions = [
  { label: "Brand Blue", value: "brandBlue" },
  { label: "Care Green", value: "careGreen" },
  { label: "Warm Gold", value: "warmGold" },
  { label: "Family Purple", value: "familyPurple" },
  { label: "Alert Rose", value: "alertRose" },
  { label: "Support Orange", value: "supportOrange" },
  { label: "Brand Gradient", value: "brandGradient" },
];

const sectionIdField: Field = {
  name: "sectionId",
  type: "text",
  admin: {
    description: "Optional HTML id for anchor links.",
  },
};

const actionsField: Field = {
  name: "actions",
  type: "array",
  fields: [
    { name: "label", type: "text", required: true },
    { name: "href", type: "text", required: true },
    {
      name: "variant",
      type: "select",
      defaultValue: "primary",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Accent", value: "accent" },
      ],
    },
    {
      name: "iconKey",
      type: "select",
      options: iconOptions,
    },
  ],
};

const bulletsField: Field = {
  name: "bullets",
  type: "array",
  fields: [{ name: "text", type: "text", required: true }],
};

export const HeroBlock: Block = {
  slug: "hero",
  interfaceName: "HeroBlock",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    sectionIdField,
    {
      name: "variant",
      type: "select",
      required: true,
      defaultValue: "marketing",
      options: [
        { label: "Marketing", value: "marketing" },
        { label: "App", value: "app" },
      ],
    },
    {
      name: "theme",
      type: "select",
      defaultValue: "light",
      options: [
        { label: "Light", value: "light" },
        { label: "Brand", value: "brand" },
      ],
    },
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "highlight", type: "text" },
    { name: "body", type: "textarea" },
    actionsField,
    {
      name: "media",
      type: "group",
      fields: [
        {
          name: "kind",
          type: "select",
          defaultValue: "none",
          options: [
            { label: "None", value: "none" },
            { label: "Carousel", value: "carousel" },
            { label: "Media Image", value: "image" },
          ],
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          admin: {
            condition: (_, siblingData) => siblingData?.kind === "image",
            description: "Choose an image from Payload Media.",
          },
        },
        {
          name: "images",
          type: "array",
          labels: { singular: "Carousel Image", plural: "Carousel Images" },
          admin: {
            condition: (_, siblingData) => siblingData?.kind === "carousel",
            description: "Choose carousel images from Payload Media.",
          },
          fields: [
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "alt",
              type: "text",
              admin: {
                description: "Optional override. Defaults to the Media alt text.",
              },
            },
          ],
        },
        {
          name: "alt",
          type: "text",
          admin: {
            condition: (_, siblingData) => siblingData?.kind === "image",
            description: "Optional override. Defaults to the Media alt text.",
          },
        },
      ],
    },
  ],
};

export const FeatureGridBlock: Block = {
  slug: "featureGrid",
  interfaceName: "FeatureGridBlock",
  labels: { singular: "Feature Grid", plural: "Feature Grids" },
  fields: [
    sectionIdField,
    { name: "title", type: "text", required: true },
    { name: "intro", type: "textarea" },
    {
      name: "layout",
      type: "select",
      defaultValue: "cards",
      options: [
        { label: "Cards", value: "cards" },
        { label: "Compact", value: "compact" },
      ],
    },
    {
      name: "background",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Muted", value: "muted" },
      ],
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        { name: "iconKey", type: "select", options: iconOptions },
        {
          name: "accentPreset",
          type: "select",
          defaultValue: "brandBlue",
          options: accentPresetOptions,
        },
        bulletsField,
      ],
    },
  ],
};

export const StatsBlock: Block = {
  slug: "stats",
  interfaceName: "StatsBlock",
  labels: { singular: "Stats", plural: "Stats" },
  fields: [
    sectionIdField,
    { name: "title", type: "text" },
    { name: "intro", type: "textarea" },
    {
      name: "variant",
      type: "select",
      defaultValue: "metrics",
      options: [
        { label: "Metrics", value: "metrics" },
        { label: "Steps", value: "steps" },
      ],
    },
    {
      name: "background",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Muted", value: "muted" },
      ],
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "value", type: "text", required: true },
        { name: "label", type: "text", required: true },
        { name: "description", type: "textarea" },
      ],
    },
  ],
};

export const ContentBlock: Block = {
  slug: "content",
  interfaceName: "ContentBlock",
  labels: { singular: "Content", plural: "Content" },
  fields: [
    sectionIdField,
    { name: "title", type: "text" },
    { name: "intro", type: "textarea" },
    { name: "prose", type: "textarea" },
    bulletsField,
    actionsField,
    {
      name: "aside",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "body", type: "textarea" },
        actionsField,
        { name: "note", type: "textarea" },
      ],
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "centered",
      options: [
        { label: "Centered", value: "centered" },
        { label: "Split", value: "split" },
      ],
    },
    {
      name: "background",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Muted", value: "muted" },
      ],
    },
  ],
};

export const CTABlock: Block = {
  slug: "cta",
  interfaceName: "CTABlock",
  labels: { singular: "CTA", plural: "CTAs" },
  fields: [
    sectionIdField,
    { name: "title", type: "text", required: true },
    { name: "body", type: "textarea" },
    actionsField,
    { name: "note", type: "textarea" },
    {
      name: "theme",
      type: "select",
      defaultValue: "brand",
      options: [
        { label: "Brand", value: "brand" },
        { label: "Slate", value: "slate" },
      ],
    },
  ],
};

export const MediaBlock: Block = {
  slug: "media",
  interfaceName: "MediaBlock",
  labels: { singular: "Media", plural: "Media" },
  fields: [
    sectionIdField,
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "alt",
      type: "text",
      admin: {
        description: "Optional override. Defaults to the Media alt text.",
      },
    },
    { name: "caption", type: "text" },
    {
      name: "layout",
      type: "select",
      defaultValue: "contained",
      options: [
        { label: "Contained", value: "contained" },
        { label: "Wide", value: "wide" },
      ],
    },
    {
      name: "background",
      type: "select",
      defaultValue: "plain",
      options: [
        { label: "Plain", value: "plain" },
        { label: "Muted", value: "muted" },
      ],
    },
  ],
};

export const TestimonialBlock: Block = {
  slug: "testimonial",
  interfaceName: "TestimonialBlock",
  labels: { singular: "Testimonial", plural: "Testimonials" },
  fields: [
    sectionIdField,
    { name: "quote", type: "textarea", required: true },
    { name: "author", type: "text", required: true },
    { name: "role", type: "text" },
  ],
};

export const FAQBlock: Block = {
  slug: "faq",
  interfaceName: "FAQBlock",
  labels: { singular: "FAQ", plural: "FAQs" },
  fields: [
    sectionIdField,
    { name: "title", type: "text", required: true },
    { name: "intro", type: "textarea" },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
  ],
};

export const LegalArticleBlock: Block = {
  slug: "legalArticle",
  interfaceName: "LegalArticleBlock",
  labels: { singular: "Legal Article", plural: "Legal Articles" },
  fields: [
    sectionIdField,
    { name: "title", type: "text", required: true },
    { name: "lastUpdated", type: "text" },
    { name: "intro", type: "textarea" },
    {
      name: "sections",
      type: "array",
      required: true,
      fields: [
        { name: "anchor", type: "text", required: true },
        { name: "title", type: "text", required: true },
        { name: "iconKey", type: "select", options: iconOptions },
        { name: "body", type: "textarea" },
        bulletsField,
      ],
    },
  ],
};

export const ContactFormBlock: Block = {
  slug: "contactForm",
  interfaceName: "ContactFormBlock",
  labels: { singular: "Contact Form", plural: "Contact Forms" },
  fields: [
    sectionIdField,
    { name: "title", type: "text", required: true },
    { name: "intro", type: "textarea" },
    {
      name: "inquiryTypes",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text", required: true },
      ],
    },
    {
      name: "contactCards",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
        { name: "href", type: "text" },
        { name: "iconKey", type: "select", options: iconOptions },
        { name: "note", type: "text" },
      ],
    },
  ],
};

export const PartnershipCardsBlock: Block = {
  slug: "partnershipCards",
  interfaceName: "PartnershipCardsBlock",
  labels: { singular: "Partnership Cards", plural: "Partnership Cards" },
  fields: [
    sectionIdField,
    { name: "title", type: "text", required: true },
    { name: "intro", type: "textarea" },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "subtitle", type: "text" },
        { name: "body", type: "textarea", required: true },
        { name: "iconKey", type: "select", options: iconOptions },
        bulletsField,
        actionsField,
      ],
    },
  ],
};

export const BlogArchiveBlock: Block = {
  slug: "blogArchive",
  interfaceName: "BlogArchiveBlock",
  labels: { singular: "Blog Archive", plural: "Blog Archives" },
  fields: [
    sectionIdField,
    { name: "title", type: "text", required: true, defaultValue: "CareShare Blog" },
    { name: "intro", type: "textarea" },
  ],
};

export const pageBlocks: Block[] = [
  HeroBlock,
  FeatureGridBlock,
  StatsBlock,
  ContentBlock,
  CTABlock,
  MediaBlock,
  TestimonialBlock,
  FAQBlock,
  LegalArticleBlock,
  ContactFormBlock,
  PartnershipCardsBlock,
  BlogArchiveBlock,
];

export const contentPageBlocks: Block[] = [
  FeatureGridBlock,
  StatsBlock,
  ContentBlock,
  CTABlock,
  MediaBlock,
  TestimonialBlock,
  FAQBlock,
  LegalArticleBlock,
  ContactFormBlock,
  PartnershipCardsBlock,
  BlogArchiveBlock,
];
