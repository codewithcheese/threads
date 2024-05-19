import { runMigrations } from "$database"
import { describe, it } from "vitest";

it("should run migrations", async () => {
  await runMigrations();
});
