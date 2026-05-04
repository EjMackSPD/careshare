export const seedPages = [
  {
    title: "CareShare",
    slug: "home",
    seo: {
      title: "CareShare - Coordinate Family Care Together",
      description:
        "CareShare helps families coordinate care, expenses, tasks, calendars, and support in one shared workspace.",
    },
    layout: [
      {
        blockType: "hero",
        sectionId: "home-hero",
        variant: "marketing",
        theme: "light",
        title: "Caring for loved ones,",
        highlight: "together",
        body:
          "CareShare helps caregivers, families, care centers, and individuals start the right care workflow from day one.",
        actions: [
          { href: "/onboarding", label: "Choose Your Onboarding Path", variant: "primary" },
          { href: "/login", label: "Quick Demo", variant: "accent" },
        ],
        media: { kind: "carousel" },
      },
      {
        blockType: "featureGrid",
        sectionId: "home-benefits",
        title: "Why CareShare?",
        items: [
          {
            title: "Split Costs Fairly",
            body: "Track expenses and contributions transparently without awkward money conversations.",
            iconKey: "wallet",
            accent: { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", foreground: "#ffffff" },
          },
          {
            title: "Coordinate Events",
            body: "Plan birthdays, appointments, and food deliveries together so everyone stays in the loop.",
            iconKey: "calendarDays",
            accent: { background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", foreground: "#ffffff" },
          },
          {
            title: "Bring Family Together",
            body: "Share the responsibility of care and help each person contribute in their own way.",
            iconKey: "users",
            accent: { background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", foreground: "#ffffff" },
          },
          {
            title: "For Care Providers",
            body: "Support families with a shared workspace that keeps plans, updates, and responsibilities organized.",
            iconKey: "heart",
            accent: { background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)", foreground: "#ffffff" },
          },
        ],
      },
      {
        blockType: "content",
        sectionId: "home-demo",
        title: "See CareShare in Action",
        intro: "Experience the platform with a fully interactive demo account. No signup required.",
        bullets: [
          { text: "Pre-loaded with realistic caregiving scenarios" },
          { text: "Explore all major workflows and features" },
          { text: "See how families coordinate care together" },
          { text: "Test tasks, calendars, and finances with real sample data" },
        ],
        layout: "split",
        background: "muted",
        aside: {
          title: "Try the Demo Walkthrough",
          body: "Open the login page and jump in with demo mode to explore the product from a real family workspace.",
          actions: [{ href: "/login", label: "Try Demo Walkthrough", variant: "accent", iconKey: "video" }],
          note: "Use the Quick Demo option on the login page.",
        },
      },
      {
        blockType: "cta",
        sectionId: "home-cta",
        theme: "brand",
        title: "Ready to get started?",
        body: "Choose the setup flow that matches how you care and who you support.",
        actions: [{ href: "/onboarding", label: "Start Setup", variant: "primary" }],
      },
    ],
  },
  {
    title: "Features",
    slug: "features",
    seo: {
      title: "CareShare Features",
      description: "Tools for family caregiving coordination, shared costs, tasks, calendars, care plans, and secure communication.",
    },
    layout: [
      {
        blockType: "hero",
        sectionId: "features-hero",
        variant: "marketing",
        theme: "brand",
        eyebrow: "All-in-One Caregiving Platform",
        title: "Everything Your Family Needs",
        highlight: "In One Beautiful Place",
        body:
          "Stop juggling emails, texts, and spreadsheets. CareShare brings everyone together with tools that actually make caregiving easier.",
        actions: [
          { href: "/onboarding", label: "Start Free Trial", variant: "primary", iconKey: "sparkles" },
          { href: "/login", label: "Try Demo", variant: "secondary", iconKey: "video" },
        ],
        media: {
          kind: "image",
          src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1920&q=80",
          alt: "A care team meeting together",
        },
      },
      {
        blockType: "featureGrid",
        sectionId: "features-core",
        title: "Powerful Features That Make a Difference",
        intro: "Everything you need to coordinate care, all in one place.",
        background: "muted",
        items: [
          {
            title: "Smart Financial Tracking",
            body: "Track expenses, split costs fairly, and keep everyone aligned financially.",
            iconKey: "wallet",
            accent: { background: "#dbeafe", foreground: "#2563eb" },
            bullets: [
              { text: "Transparent contribution tracking" },
              { text: "Automatic bill splitting" },
              { text: "Payment reminders" },
              { text: "Financial reports and exports" },
            ],
          },
          {
            title: "Shared Family Calendar",
            body: "Keep appointments, milestones, and routines synced in one shared timeline.",
            iconKey: "calendar",
            accent: { background: "#dcfce7", foreground: "#16a34a" },
            bullets: [
              { text: "Medical appointments" },
              { text: "Family celebrations" },
              { text: "Medication schedules" },
              { text: "Automatic reminders" },
            ],
          },
          {
            title: "Task Coordination",
            body: "Assign responsibilities clearly and balance the work across your family.",
            iconKey: "target",
            accent: { background: "#fef3c7", foreground: "#ca8a04" },
            bullets: [
              { text: "Easy task assignment" },
              { text: "Priority levels" },
              { text: "Progress tracking" },
              { text: "Workload balancing" },
            ],
          },
          {
            title: "Family Communication Hub",
            body: "Share updates, photos, and care context without losing the thread.",
            iconKey: "messageSquare",
            accent: { background: "#e9d5ff", foreground: "#7c3aed" },
            bullets: [
              { text: "Secure family messaging" },
              { text: "Photo sharing" },
              { text: "Update notifications" },
              { text: "Less group-text chaos" },
            ],
          },
        ],
      },
      {
        blockType: "stats",
        sectionId: "features-steps",
        title: "Getting Started is Easy",
        variant: "steps",
        background: "muted",
        items: [
          { value: "1", label: "Create Your Family", description: "Set up your care workspace in minutes." },
          { value: "2", label: "Invite Family Members", description: "Bring relatives and helpers in with clear roles." },
          { value: "3", label: "Start Coordinating", description: "Add events, tasks, costs, and updates from one shared system." },
        ],
      },
      {
        blockType: "cta",
        sectionId: "features-cta",
        theme: "slate",
        title: "Ready to Transform Family Caregiving?",
        body: "Join families who are caring better, together.",
        actions: [
          { href: "/onboarding", label: "Get Started Free", variant: "primary", iconKey: "sparkles" },
          { href: "/login", label: "Try Demo Account", variant: "secondary" },
        ],
        note: "No credit card required. Cancel anytime.",
      },
    ],
  },
  {
    title: "About",
    slug: "about",
    seo: {
      title: "About CareShare",
      description: "CareShare helps families make caregiving a shared journey with transparency, compassion, and ease.",
    },
    layout: [
      {
        blockType: "hero",
        sectionId: "about-hero",
        variant: "marketing",
        theme: "light",
        title: "Our Mission: Making Caregiving a Shared Journey",
        body:
          "We believe caring for loved ones should not fall on one person's shoulders. CareShare helps families coordinate care together with transparency, compassion, and ease.",
      },
      {
        blockType: "content",
        sectionId: "about-story",
        title: "Our Story",
        prose:
          "CareShare was born from a personal experience that millions of families face. When a loved one needs increasing levels of care, families often struggle to coordinate across distance, schedules, and expectations.\n\nEmails get lost. Phone calls are missed. Financial contributions become confusing. Family members want to help but do not always know how.\n\nCareShare is a family coordination platform built around a simple belief: caregiving is a collaborative act of love.",
        layout: "centered",
      },
      {
        blockType: "featureGrid",
        sectionId: "about-values",
        title: "What We Stand For",
        items: [
          { title: "Family First", body: "Every feature starts with one question: does this make life easier for families?", iconKey: "heart", accent: { background: "#dbeafe", foreground: "#2563eb" } },
          { title: "Shared Responsibility", body: "Caregiving is a team effort. We design tools that help distribute the load fairly.", iconKey: "users", accent: { background: "#dcfce7", foreground: "#16a34a" } },
          { title: "Simplicity & Transparency", body: "Complex situations need simple tools, clear communication, and transparent records.", iconKey: "sparkles", accent: { background: "#fef3c7", foreground: "#ca8a04" } },
          { title: "Purpose-Driven", body: "We support families during one of life's most challenging journeys.", iconKey: "target", accent: { background: "#e9d5ff", foreground: "#7c3aed" } },
        ],
      },
      {
        blockType: "cta",
        sectionId: "about-cta",
        title: "Join Us in Transforming Caregiving",
        body: "Whether you are a family caregiver, care provider, or partner, CareShare gives coordination a calmer center.",
        actions: [
          { href: "/onboarding", label: "Start Your Family Group", variant: "primary" },
          { href: "/partnerships", label: "Become a Partner", variant: "secondary" },
        ],
      },
    ],
  },
  {
    title: "Partnerships",
    slug: "partnerships",
    seo: {
      title: "Partner with CareShare",
      description: "Partner with CareShare to help families coordinate better care for loved ones.",
    },
    layout: [
      {
        blockType: "hero",
        sectionId: "partnerships-hero",
        variant: "marketing",
        theme: "brand",
        title: "Partner with CareShare",
        body:
          "Join us in transforming family caregiving. Together, we can help millions of families coordinate better care for their loved ones.",
        actions: [
          { href: "/contact", label: "Get in Touch", variant: "primary", iconKey: "mail" },
          { href: "/contact", label: "Schedule a Demo", variant: "secondary", iconKey: "calendar" },
        ],
      },
      {
        blockType: "stats",
        sectionId: "partnerships-stats",
        variant: "metrics",
        items: [
          { value: "10,000+", label: "Families Served" },
          { value: "250+", label: "Partner Organizations" },
          { value: "98%", label: "Satisfaction Rate" },
        ],
      },
      {
        blockType: "partnershipCards",
        sectionId: "partnerships-opportunities",
        title: "Partnership Opportunities",
        intro: "We support organizations that want to make family coordination clearer and more humane.",
        items: [
          {
            title: "Senior Living Communities",
            subtitle: "Nursing homes, assisted living, memory care",
            body: "Enhance family engagement with a dedicated platform for coordinating care, sharing updates, and managing costs.",
            iconKey: "building",
            bullets: [
              { text: "White-label family portal options" },
              { text: "Care plan and event visibility" },
              { text: "Billing and payment coordination" },
            ],
            actions: [{ href: "/contact", label: "Learn More", variant: "primary", iconKey: "arrowRight" }],
          },
          {
            title: "Healthcare Providers",
            subtitle: "Hospitals, clinics, home health agencies",
            body: "Improve care coordination by connecting families with a shared caregiving workspace after discharge or intake.",
            iconKey: "heart",
            bullets: [
              { text: "Streamlined discharge planning" },
              { text: "Family communication tools" },
              { text: "Medication and task support" },
            ],
            actions: [{ href: "/contact", label: "Learn More", variant: "primary", iconKey: "arrowRight" }],
          },
        ],
      },
    ],
  },
  {
    title: "Contact",
    slug: "contact",
    seo: {
      title: "Contact CareShare",
      description: "Get in touch with CareShare for support, partnership opportunities, press, and product feedback.",
    },
    layout: [
      {
        blockType: "hero",
        sectionId: "contact-hero",
        variant: "marketing",
        theme: "light",
        eyebrow: "Contact",
        title: "Get in Touch",
        body: "Have questions? We are here to help. Reach out and we will get back to you as soon as possible.",
      },
      {
        blockType: "contactForm",
        sectionId: "contact-form",
        title: "Send Us a Message",
        intro: "Tell us what you need and the right person will follow up.",
        inquiryTypes: [
          { label: "General Question", value: "general" },
          { label: "Technical Support", value: "support" },
          { label: "Partnership Opportunity", value: "partnership" },
          { label: "Press & Media", value: "press" },
          { label: "Product Feedback", value: "feedback" },
        ],
        contactCards: [
          { title: "Email", body: "support@careshare.app", href: "mailto:support@careshare.app", iconKey: "mail", note: "Response within 24 hours" },
          { title: "Phone", body: "(800) 555-1234", href: "tel:+18005551234", iconKey: "phone", note: "Monday - Friday, 9AM - 5PM EST" },
          { title: "Office", body: "123 Care Street\nSan Francisco, CA 94102", iconKey: "mapPin", note: "By appointment only" },
          { title: "Support Hours", body: "Monday - Friday: 9AM - 5PM EST\nWeekend: Emergency support only", iconKey: "clock", note: "Average response: 2 hours" },
        ],
      },
    ],
  },
  {
    title: "Blog",
    slug: "blog",
    seo: {
      title: "CareShare Blog",
      description: "Expert advice, inspiring stories, and practical tips for family caregivers.",
    },
    layout: [
      {
        blockType: "hero",
        sectionId: "blog-hero",
        variant: "marketing",
        theme: "brand",
        eyebrow: "Resources & Insights",
        title: "CareShare Blog",
        body:
          "Expert advice, inspiring stories, and practical tips for family caregivers navigating the caregiving journey together.",
      },
      {
        blockType: "blogArchive",
        sectionId: "blog-archive",
        title: "Latest Articles",
        intro: "Published posts from the Payload CMS appear here automatically.",
      },
    ],
  },
  {
    title: "Privacy Policy",
    slug: "privacy",
    seo: {
      title: "Privacy Policy",
      description: "CareShare Privacy Policy and data handling practices.",
    },
    layout: [
      {
        blockType: "legalArticle",
        sectionId: "privacy-policy",
        title: "Privacy Policy",
        lastUpdated: "October 4, 2025",
        intro:
          "At CareShare, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
        sections: [
          {
            anchor: "collection",
            title: "Information We Collect",
            iconKey: "database",
            body:
              "When you create an account, we collect information such as your name, email address, and password. We also collect family and care information that you choose to share, including care recipients, events, medications, financial arrangements, and communications within your family group.",
          },
          {
            anchor: "usage",
            title: "How We Use Your Information",
            iconKey: "shield",
            body: "We use information to provide, maintain, and improve CareShare, process transactions, send service updates, respond to support requests, monitor usage, prevent fraud, and personalize your experience.",
          },
          {
            anchor: "sharing",
            title: "Information Sharing and Disclosure",
            iconKey: "users",
            body:
              "We do not sell, trade, or rent your personal information. Information you add to a family group is shared with members of that group. We may also share information with trusted service providers or when required by law.",
          },
          {
            anchor: "security",
            title: "Data Security",
            iconKey: "lock",
            body:
              "We use technical and organizational safeguards, including encryption, access controls, secure infrastructure, and employee training. No method of transmission or storage is completely secure, so absolute security cannot be guaranteed.",
          },
          {
            anchor: "rights",
            title: "Your Rights",
            iconKey: "eye",
            body: "You may request access, correction, deletion, portability, or restriction of certain processing activities by contacting privacy@careshare.app.",
          },
          {
            anchor: "contact",
            title: "Contact Us About Privacy",
            iconKey: "mail",
            body: "Questions about this Privacy Policy can be sent to privacy@careshare.app.",
          },
        ],
      },
    ],
  },
  {
    title: "Terms of Service",
    slug: "terms",
    seo: {
      title: "Terms of Service",
      description: "CareShare Terms of Service.",
    },
    layout: [
      {
        blockType: "legalArticle",
        sectionId: "terms-of-service",
        title: "Terms of Service",
        lastUpdated: "October 4, 2025",
        intro:
          "These Terms of Service govern your access to and use of CareShare's platform and services. By using CareShare, you agree to be bound by these Terms.",
        sections: [
          {
            anchor: "agreement",
            title: "Agreement to Terms",
            iconKey: "fileText",
            body: "By creating an account or using CareShare, you agree to these Terms and our Privacy Policy. If you do not agree, please do not use the platform.",
          },
          {
            anchor: "accounts",
            title: "User Accounts",
            iconKey: "checkCircle",
            body: "You agree to provide accurate information, keep account credentials confidential, and notify us of unauthorized use. You must be at least 18 years old to create an account.",
          },
          {
            anchor: "acceptable",
            title: "Acceptable Use",
            iconKey: "shield",
            body: "You agree not to violate laws, infringe rights, upload harmful software, harass users, misuse commercial access, attempt unauthorized access, impersonate others, or improperly collect personal data.",
          },
          {
            anchor: "content",
            title: "Content and Ownership",
            iconKey: "fileText",
            body: "You retain ownership of content you post to CareShare and grant us a license to use, store, and display it as needed to provide the service.",
          },
          {
            anchor: "subscriptions",
            title: "Subscriptions and Billing",
            iconKey: "wallet",
            body: "Free trials, paid subscriptions, cancellation, and refunds are handled according to the plan and billing terms shown at purchase or in your account settings.",
          },
          {
            anchor: "contact",
            title: "Contact",
            iconKey: "mail",
            body: "Questions about these Terms can be sent to support@careshare.app.",
          },
        ],
      },
    ],
  },
];

export const seedPosts = [
  {
    title: "A calmer way to start family caregiving",
    slug: "calmer-way-to-start-family-caregiving",
    excerpt:
      "The first week of caregiving can feel chaotic. A shared workspace gives every helper a clear place to begin.",
    category: "CAREGIVING_TIPS",
    author: "CareShare Team",
    authorTitle: "Care Coordination",
    coverImageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1600&q=80",
    readTime: 4,
    publishedAt: "2025-10-04T12:00:00.000Z",
    content:
      "## Start with one shared source of truth\n\nCaregiving often begins with scattered messages, partial context, and people trying to help from different places. A shared workspace gives everyone the same view of what matters now.\n\n## Make responsibilities visible\n\nTasks, appointments, costs, and care notes should be clear enough that helpers can contribute without asking the same questions over and over.\n\n## Keep the emotional load in mind\n\nCoordination tools work best when they reduce stress, not when they add another inbox. Start small, invite the people who need context, and let the system grow with your family's needs.",
    seo: {
      title: "A Calmer Way to Start Family Caregiving",
      description: "How a shared workspace helps families coordinate care from the first week.",
    },
  },
];
