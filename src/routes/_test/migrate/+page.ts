import { exposeDb } from "$database";

export async function load({ depends }) {
  try {
    await exposeDb();
    const { runMigrations } = await import("$database");
    console.log("Migrating database");
    await runMigrations();
    console.log("Migration complete");
  } catch (err) {
    console.error(err);
  }
  return {};
}
