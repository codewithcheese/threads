// findEmoji.ts
export type EmojiMatch = Readonly<{
  position: number;
  shortcode: string;
  unifiedID: string;
}>;

const emojiMap: Record<string, string> = {
  ":)": "1F642",
  ":D": "1F600",
  ":(": "1F641",
  ":P": "1F61B",
  ":p": "1F61B",
  ";)": "1F609",
  ":O": "1F62E",
  ":o": "1F62E",
  ":*": "1F618",
  ":|": "1F610",
  ":/": "1F615",
  ":\\": "1F615",
  ":X": "1F636",
  ":x": "1F636",
  ":@": "1F620",
  ":'(": "1F622",
  ":'D": "1F602",
  "^_^": "1F601",
  "^-^": "1F601",
  "<3": "2764",
  "(^_^)": "263A",
  "(^-^)": "263A",
  "(^o^)": "263A",
  "(^—^)": "263A",
};

export default function findEmoji(text: string): EmojiMatch | null {
  for (const [shortcode, unifiedID] of Object.entries(emojiMap)) {
    const position = text.indexOf(shortcode);
    if (position !== -1) {
      return { position, shortcode, unifiedID };
    }
  }
  return null;
}
