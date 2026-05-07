import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";
import { Users } from "./payload/collections/Users.ts";
import { Media } from "./payload/collections/Media.ts";
import { Pages } from "./payload/collections/Pages.ts";
import { Posts } from "./payload/collections/Posts.ts";
import { ContactSubmissions } from "./payload/collections/ContactSubmissions.ts";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const trustedOrigins = Array.from(new Set([siteURL, "http://localhost:3000"]));
const payloadBlobToken =
  process.env.PAYLOAD_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: dirname,
    },
    meta: {
      applicationName: "CareShare CMS",
      defaultOGImageType: "off",
      description: "CareShare content and support administration.",
      icons: {
        apple: "/apple-touch-icon.png",
        icon: "/favicon.ico",
      },
      openGraph: {
        description: "CareShare content and support administration.",
        images: [
          {
            url: "/careshare-logo.png",
          },
        ],
        siteName: "CareShare",
        title: "CareShare CMS",
      },
      titleSuffix: " - CareShare CMS",
    },
    components: {
      graphics: {
        Icon: "/payload/admin/CareShareBrand.tsx#CareShareAdminIcon",
        Logo: "/payload/admin/CareShareBrand.tsx#CareShareAdminLogo",
      },
      beforeLogin: ["/payload/admin/CareShareBrand.tsx#CareShareLoginBranding"],
      afterLogin: ["/payload/admin/CareShareBrand.tsx#CareShareLoginFooter"],
      beforeNav: ["/payload/admin/CareShareBrand.tsx#CareShareAdminNavBrand"],
      views: {
        dashboard: {
          Component: "/payload/admin/CareShareDashboard.tsx#CareShareDashboard",
          meta: {
            title: "CareShare CMS",
          },
        },
        support: {
          path: "/support",
          Component: "/payload/admin/SupportOverview.tsx#SupportOverview",
          meta: {
            title: "Support Overview",
          },
        },
      },
    },
    theme: "light",
  },
  bin: [
    {
      key: "seed:payload",
      scriptPath: path.resolve(dirname, "scripts/seed-payload.mjs"),
    },
    {
      key: "migrate:payload-users",
      scriptPath: path.resolve(dirname, "scripts/migrate-users-to-payload.mjs"),
    },
  ],
  collections: [Users, Pages, Posts, Media, ContactSubmissions],
  cookiePrefix: "payload",
  cors: trustedOrigins,
  csrf: trustedOrigins,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: "payload",
    allowIDOnCreate: true,
    blocksAsJSON: true,
  }),
  plugins: [
    vercelBlobStorage({
      access: "private" as "public",
      addRandomSuffix: true,
      alwaysInsertFields: true,
      collections: {
        media: true,
      },
      token: payloadBlobToken,
    }),
  ],
  routes: {
    admin: "/admin",
    api: "/payload-api",
    graphQL: "/payload-api/graphql",
    graphQLPlayground: "/payload-api/graphql-playground",
  },
  secret:
    process.env.PAYLOAD_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "dev-only-payload-secret-change-me",
  serverURL: siteURL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
