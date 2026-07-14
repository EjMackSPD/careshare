import Image from "next/image";
import Link from "next/link";
import type { AdminViewServerProps } from "payload";

type CollectionSlug = "pages" | "posts" | "media" | "contact-submissions";

type DashboardDoc = Record<string, unknown> & {
  id?: number | string;
  slug?: string;
  title?: string;
  name?: string;
  email?: string;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
};

type RecentItem = {
  description: string;
  href: string;
  label: string;
  meta: string;
  status?: string;
};

const quickActions = [
  {
    href: "/admin/collections/pages/create",
    label: "New page",
    description: "Create a marketing or legal page.",
  },
  {
    href: "/admin/collections/posts/create",
    label: "New post",
    description: "Draft a CareShare story.",
  },
  {
    href: "/admin/collections/media/create",
    label: "Upload media",
    description: "Add public images and files.",
  },
  {
    href: "/admin/support",
    label: "Support view",
    description: "Review family operations.",
  },
];

const managementLinks = [
  {
    href: "/admin/collections/pages",
    label: "Pages",
    description: "Homepage, features, about, partnerships, contact, privacy, and terms.",
  },
  {
    href: "/admin/collections/posts",
    label: "Posts",
    description: "Blog publishing, author metadata, related posts, and SEO.",
  },
  {
    href: "/admin/collections/contact-submissions",
    label: "Contact submissions",
    description: "Inbound public requests and partnership leads.",
  },
  {
    href: "/admin/collections/users",
    label: "Users",
    description: "Payload accounts, roles, and admin access.",
  },
];

async function getTotal(payload: AdminViewServerProps["payload"], collection: CollectionSlug) {
  try {
    const result = await payload.find({
      collection,
      depth: 0,
      limit: 0,
      pagination: true,
    });

    return result.totalDocs;
  } catch {
    return 0;
  }
}

async function getRecentDocs(
  payload: AdminViewServerProps["payload"],
  collection: Exclude<CollectionSlug, "media">,
  limit = 4,
) {
  try {
    const result = await payload.find({
      collection,
      depth: 0,
      limit,
      sort: "-updatedAt",
    });

    return result.docs as unknown as DashboardDoc[];
  } catch {
    return [];
  }
}

function formatDate(value: unknown) {
  if (typeof value !== "string") {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getDocTitle(doc: DashboardDoc, fallback: string) {
  return doc.title || doc.name || doc.email || fallback;
}

function toContentItems(pages: DashboardDoc[], posts: DashboardDoc[]): RecentItem[] {
  const pageItems = pages.map((doc) => ({
    description: doc.slug ? `/${doc.slug === "home" ? "" : doc.slug}` : "Page",
    href: `/admin/collections/pages/${doc.id}`,
    label: getDocTitle(doc, "Untitled page"),
    meta: `Updated ${formatDate(doc.updatedAt)}`,
    status: doc.status,
  }));

  const postItems = posts.map((doc) => ({
    description: doc.slug ? `/blog/${doc.slug}` : "Blog post",
    href: `/admin/collections/posts/${doc.id}`,
    label: getDocTitle(doc, "Untitled post"),
    meta: `Updated ${formatDate(doc.updatedAt)}`,
    status: doc.status,
  }));

  return [...pageItems, ...postItems].slice(0, 6);
}

function toSubmissionItems(submissions: DashboardDoc[]): RecentItem[] {
  return submissions.map((doc) => ({
    description: typeof doc.email === "string" ? doc.email : "Contact submission",
    href: `/admin/collections/contact-submissions/${doc.id}`,
    label: getDocTitle(doc, "New submission"),
    meta: `Received ${formatDate(doc.createdAt || doc.updatedAt)}`,
    status: doc.status,
  }));
}

function StatusPill({ status }: { status?: string }) {
  if (!status) {
    return null;
  }

  return <span className="careshare-dashboard-pill">{status}</span>;
}

function ActivityList({
  empty,
  items,
}: {
  empty: string;
  items: RecentItem[];
}) {
  if (items.length === 0) {
    return <p className="careshare-dashboard-empty">{empty}</p>;
  }

  return (
    <div className="careshare-dashboard-list">
      {items.map((item) => (
        <Link className="careshare-dashboard-row" href={item.href} key={item.href}>
          <span>
            <strong>{item.label}</strong>
            <span>{item.description}</span>
          </span>
          <span className="careshare-dashboard-row__meta">
            <StatusPill status={item.status} />
            <span>{item.meta}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export async function CareShareDashboard({ payload, user }: AdminViewServerProps) {
  const [pages, posts, media, submissions, recentPages, recentPosts, recentSubmissions] =
    await Promise.all([
      getTotal(payload, "pages"),
      getTotal(payload, "posts"),
      getTotal(payload, "media"),
      getTotal(payload, "contact-submissions"),
      getRecentDocs(payload, "pages", 4),
      getRecentDocs(payload, "posts", 4),
      getRecentDocs(payload, "contact-submissions", 5),
    ]);

  const email = typeof user?.email === "string" ? user.email : "CareShare admin";
  const roles = Array.isArray((user as { roles?: unknown })?.roles)
    ? ((user as { roles?: unknown }).roles as unknown[])
    : [];
  const isSuperAdmin = roles.includes("super-admin");
  const contentItems = toContentItems(recentPages, recentPosts);
  const submissionItems = toSubmissionItems(recentSubmissions);

  return (
    <main className="careshare-admin-dashboard">
      <div className="careshare-admin-dashboard__shell">
        <header className="careshare-dashboard-header">
          <div className="careshare-dashboard-header__identity">
            <Image alt="" height={64} priority src="/favicon-32x32.png" width={64} />
            <div>
              <p>CareShare CMS</p>
              <h1>Admin dashboard</h1>
            </div>
          </div>
          <div className="careshare-dashboard-header__actions">
            {isSuperAdmin && (
              <Link className="careshare-dashboard-header__cta" href="/dashboard">
                Go to family dashboard
              </Link>
            )}
            <div className="careshare-dashboard-header__user">
              <span>Signed in</span>
              <strong>{email}</strong>
            </div>
          </div>
        </header>

        <section className="careshare-dashboard-metrics" aria-label="CMS totals">
          <div>
            <span>Pages</span>
            <strong>{pages}</strong>
          </div>
          <div>
            <span>Posts</span>
            <strong>{posts}</strong>
          </div>
          <div>
            <span>Media</span>
            <strong>{media}</strong>
          </div>
          <div>
            <span>Submissions</span>
            <strong>{submissions}</strong>
          </div>
        </section>

        <section className="careshare-dashboard-actions" aria-label="Quick actions">
          {quickActions.map((action) => (
            <Link href={action.href} key={action.href}>
              <strong>{action.label}</strong>
              <span>{action.description}</span>
            </Link>
          ))}
        </section>

        <div className="careshare-dashboard-grid">
          <section className="careshare-dashboard-panel careshare-dashboard-panel--wide">
            <div className="careshare-dashboard-panel__header">
              <div>
                <h2>Recent content</h2>
                <p>Latest pages and posts touched in Payload.</p>
              </div>
              <Link href="/admin/collections/pages">All pages</Link>
            </div>
            <ActivityList empty="No recent content found." items={contentItems} />
          </section>

          <section className="careshare-dashboard-panel">
            <div className="careshare-dashboard-panel__header">
              <div>
                <h2>Recent submissions</h2>
                <p>New public contact activity.</p>
              </div>
              <Link href="/admin/collections/contact-submissions">Open</Link>
            </div>
            <ActivityList empty="No contact submissions yet." items={submissionItems} />
          </section>

          <section className="careshare-dashboard-panel">
            <div className="careshare-dashboard-panel__header">
              <div>
                <h2>Manage</h2>
                <p>Common administrative areas.</p>
              </div>
            </div>
            <div className="careshare-dashboard-manage">
              {managementLinks.map((item) => (
                <Link href={item.href} key={item.href}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
