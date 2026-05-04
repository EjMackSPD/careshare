import { sql } from '@payloadcms/db-postgres'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."pages" ADD COLUMN "hero" jsonb;
  ALTER TABLE "payload"."_pages_v" ADD COLUMN "version_hero" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."pages" DROP COLUMN "hero";
  ALTER TABLE "payload"."_pages_v" DROP COLUMN "version_hero";`)
}
