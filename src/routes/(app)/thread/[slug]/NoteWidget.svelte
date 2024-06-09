<script lang="ts">
  import type { Note } from "$database/schema";
  import { createChat, createEmptyNote, upsertNote } from "./$data";
  import Editor from "./Editor.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { slugify } from "$lib/slugify";
  import { Button } from "$components/ui/button";
  import toast from "svelte-french-toast";
  import { page } from "$app/stores";
  import { HashIcon, MessageCircleIcon, XIcon } from "lucide-svelte";

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

  let activeNote = $derived(note ? note : createEmptyNote());
  let command: string | null = $state(null);

  async function handleChange(value: string) {
    console.log("handleSubmit", value);
    if (activeNote.content !== value) {
      activeNote.content = value;
      await upsertNote(activeNote);
      await invalidate("view:notes");
    }
  }

  async function handleSubmit(value: string) {
    await handleChange(value);
    onSubmit();
  }

  async function handleLabelSubmit(label: string) {
    console.log("handleLabelSubmit", label);
    if (!activeNote.labels.includes(label)) {
      activeNote.labels.push(label);
      await upsertNote(activeNote);
      await invalidate("view:notes");
    }
  }

  function handleCommandSubmit(value: string) {
    switch (value) {
      case "youtube-video":
        command = value;
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

  async function deleteLabel(label: string) {
    activeNote.labels = activeNote.labels.filter((l) => l !== label);
    await upsertNote(activeNote);
    await invalidate("view:notes");
  }
</script>

<div class="note">
  {#if !focused && activeNote.content.trim() === ""}{:else}
    <Editor
      {focusDirection}
      {focusLeft}
      {focused}
      content={activeNote.content}
      {onFocus}
      {onFocusPrevious}
      {onFocusNext}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onLabelSubmit={handleLabelSubmit}
      onCommandSubmit={handleCommandSubmit}
    />
  {/if}
  <div class="space-x-1">
    {#each activeNote.labels as label}
      <Button
        class="group h-6 rounded-3xl bg-cyan-50 p-1 font-normal hover:bg-cyan-50"
        variant="ghost"
        onclick={() => handleLabelClick(label)}
      >
        <span
          onclick={() => deleteLabel(label)}
          class="hidden rounded-2xl hover:bg-cyan-200 group-hover:block"
        >
          <XIcon class="h-3 w-3" /></span
        >
        <span class="group-hover:hidden">
          <HashIcon class="h-3 w-3" />
        </span>
        {label}
      </Button>
    {/each}
  </div>

  {#if activeNote.chatId}
    <a href={`/thread/${$page.params.slug}/chat/${activeNote.chatId}`}>
      <Button variant="outline" class="p-1 px-4 text-sm">
        <MessageCircleIcon class="h-4 w-4" />
      </Button>
    </a>
  {/if}
  {#if command === "youtube-video"}
    <div class="w-full">Youtube</div>
  {/if}
</div>

<style lang="postcss">
  :global(.note) {
    @apply leading-snug;
  }
  :global(.note p) {
    @apply pb-2;
  }
</style>
