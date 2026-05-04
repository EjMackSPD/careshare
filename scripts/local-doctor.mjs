import nextEnv from "@next/env";
import net from "node:net";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd(), true);

const requiredEnv = ["DATABASE_URL", "PAYLOAD_SECRET"];
const recommendedEnv = [
  "NEXT_PUBLIC_SITE_URL",
  "PAYLOAD_BLOB_READ_WRITE_TOKEN",
  "PAYLOAD_BOOTSTRAP_ADMIN_EMAIL",
  "PAYLOAD_BOOTSTRAP_ADMIN_PASSWORD",
];

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, "localhost");

    socket.once("connect", () => {
      socket.end();
      resolve(false);
    });

    socket.once("error", () => resolve(true));
  });
}

async function checkDatabase() {
  if (!process.env.DATABASE_URL) {
    return { ok: false, message: "DATABASE_URL is missing" };
  }

  try {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const result = await client.query(`
      select
        to_regclass('payload.pages') is not null as has_payload_pages,
        to_regclass('payload.users') is not null as has_payload_users
    `);
    await client.end();

    const row = result.rows[0];
    if (!row.has_payload_pages || !row.has_payload_users) {
      return {
        ok: false,
        message: "Payload tables are missing. Run npm run payload:migrate.",
      };
    }

    return { ok: true, message: "Database reachable and Payload tables exist" };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  console.log(`Node: ${process.version}`);

  for (const key of requiredEnv) {
    console.log(`${process.env[key] ? "OK" : "MISSING"} required env: ${key}`);
  }

  for (const key of recommendedEnv) {
    console.log(`${process.env[key] ? "OK" : "WARN"} recommended env: ${key}`);
  }

  const portOpen = await checkPort(3000);
  console.log(`${portOpen ? "OK" : "WARN"} port 3000 ${portOpen ? "is available" : "is already in use"}`);

  const db = await checkDatabase();
  console.log(`${db.ok ? "OK" : "ERROR"} database: ${db.message}`);

  if (!process.env.PAYLOAD_SECRET || !db.ok) {
    process.exitCode = 1;
  }
}

await main();
