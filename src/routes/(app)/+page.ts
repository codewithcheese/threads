import { redirect } from "@sveltejs/kit";

export function load() {
  return redirect(301, "/thread/recent");
}
