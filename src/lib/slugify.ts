import slugifyRaw from "@sindresorhus/slugify";
import { urlAlphabet } from "nanoid";

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

export function slugify(name: string): string {
  const slug = slugifyRaw(name);

  // Generate a unique identifier using the simple hash function
  const hash = simpleHash(name);
  let uniqueId = "";
  for (let i = 0; i < 8; i++) {
    const index = Math.abs(hash >> (i * 5)) % urlAlphabet.length;
    uniqueId += urlAlphabet[index];
  }

  return `${slug}-${uniqueId.slice(0, 6)}`;
}
