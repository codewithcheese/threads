import { CHAT_ENABLED } from "$lib/flags";
import { type Trigger } from "prosemirror-autocomplete";

export const triggers: (Trigger & { allowNewValues: boolean })[] = [
  {
    name: "tag",
    trigger: "#",
    cancelOnFirstSpace: true,
    allowNewValues: true,
  },
  {
    name: "command",
    trigger: "/",
    cancelOnFirstSpace: true,
    allowNewValues: false,
  },
];

export type AutocompleteOption = {
  id: string;
  name: string;
  group: string;
  visible?: boolean;
};

export let commands: AutocompleteOption[] = [
  {
    id: "youtube-video",
    name: "Youtube Video",
    group: "Insert",
  },
  {
    id: "twitter-profile",
    name: "Twitter Profile",
    group: "Insert",
  },
  {
    id: "tweet",
    name: "Twitter Tweet",
    group: "Insert",
  },
];

if (CHAT_ENABLED) {
  commands.push({
    id: "new-chat",
    name: "New Chat",
    group: "Action",
  });
}
