import "../../app.css";
import "@fontsource-variable/inter";
import { exposeDb, runMigrations } from "$database";

export const ssr = false;

export async function load() {
  await exposeDb();
  await runMigrations();
}
