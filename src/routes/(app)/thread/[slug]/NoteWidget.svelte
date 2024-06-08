<script lang="ts">
  import type { Note } from "$database/schema";
  import { COMMANDS, createChat, upsertNote } from "./$data";
  import Editor from "./Editor.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { nanoid } from "nanoid";
  import { slugify } from "$lib/slugify";
  import { Button } from "$components/ui/button";
  import toast from "svelte-french-toast";
  import { page } from "$app/stores";
  import { MessageCircleIcon } from "lucide-svelte";
  import type { Mention } from "$lib/prosemirror/schema";

  let {
    note,
    focusLeft = undefined,
    focusDirection = undefined,
    focused = false,
    onFocus = () => {},
    onFocusPrevious = () => {},
    onFocusNext = () => {},
    onSubmit = () => {},
  }: {
    note?: Note;
    focusLeft?: number;
    focusDirection?: "top" | "bottom";
    focused: boolean;
    onFocus: () => void;
    onSubmit: () => void;
    onFocusPrevious: (left: number) => void;
    onFocusNext: (left: number) => void;
  } = $props();

  let activeNote = $derived(note ? note : emptyNote());
  let activeCommand: keyof typeof COMMANDS | null = $state(null);

  function emptyNote(): Note {
    return {
      id: nanoid(10),
      content: "",
      labels: [],
      chatId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async function handleSubmit(value: string, _mentions: Mention[]) {
    if (activeNote.content !== value) {
      activeNote.content = value;
      await upsertNote(activeNote);
      await invalidate("view:notes");
    }
    onSubmit();
  }

  async function handleLabelSubmit(label: string) {
    if (!activeNote.labels.includes(label)) {
      activeNote.labels.push(label);
      await upsertNote(activeNote);
      await invalidate("view:notes");
    }
  }

  function handleCommandSubmit(commandId: keyof typeof COMMANDS) {
    console.log("command", commandId);
    switch (commandId) {
      case "youtube-video":
        activeCommand = commandId;
        break;
      case "new-chat":
        handleNewChat();
        break;
      default:
        break;
    }
  }

  async function handleNewChat() {
    if (activeNote.chatId) {
      return toast.error(
        "You can only have one chat per note. Please create a new note.",
      );
    }
    console.log("creating chat");
    activeNote.chatId = await createChat(activeNote.id);
    await goto(`/thread/${$page.params.slug}/chat/${activeNote.chatId}`);
  }

  async function handleLabelClick(label: string) {
    await goto(`/thread/${slugify(label)}`);
  }
</script>

{#if !focused && activeNote.content.trim() === ""}{:else}
  <Editor
    {focusDirection}
    {focusLeft}
    {focused}
    content={activeNote.content}
    {onFocus}
    {onFocusPrevious}
    {onFocusNext}
    onSubmit={handleSubmit}
    onLabelSubmit={handleLabelSubmit}
    onCommandSubmit={handleCommandSubmit}
  />
{/if}
{#if activeNote.chatId}
  <a href={`/thread/${$page.params.slug}/chat/${activeNote.chatId}`}>
    <Button variant="outline" class="p-1 px-4 text-sm">
      <MessageCircleIcon class="h-4 w-4" />
    </Button>
  </a>
{/if}
{#if activeCommand === "youtube-video"}
  <div class="w-full">Youtube</div>
{/if}
<div>
  {#each activeNote.labels as label}
    <Button
      class="h-6 rounded-3xl p-1 font-normal"
      variant="ghost"
      onclick={() => handleLabelClick(label)}
    >
      {label}
    </Button>
  {/each}
</div>
