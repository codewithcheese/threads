<script lang="ts">
  import type { Note } from "$database/schema";
  import { COMMANDS, createChat, upsertNote } from "./$data";
  import Editor from "./Editor.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { nanoid } from "nanoid";
  import { slugify } from "$lib/slugify";
  import { Button } from "$components/ui/button";
  import toast from "svelte-french-toast";
  import Chat from "./Chat.svelte";

  let {
    note,
    focused = false,
    onFocus = () => {},
    onSubmit = () => {},
  }: {
    note?: Note;
    focused: boolean;
    onFocus: () => void;
    onSubmit: () => void;
  } = $props();

  let activeNote = $derived(note ? note : emptyNote());
  let activeCommand: keyof typeof COMMANDS | null = $state(null);
  let chatOpen = $state(false);

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

  async function handleSubmit(value: string) {
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
    chatOpen = true;
  }

  async function handleLabelClick(label: string) {
    await goto(`/thread/${slugify(label)}`);
  }
</script>

<Editor
  {focused}
  content={activeNote.content}
  {onFocus}
  onSubmit={handleSubmit}
  onLabelSubmit={handleLabelSubmit}
  onCommandSubmit={handleCommandSubmit}
/>
{#if activeCommand === "youtube-video"}
  <div class="w-full">Youtube</div>
{/if}
{#if activeNote.chatId}
  <Chat
    id={activeNote.chatId}
    open={chatOpen}
    onClose={() => (chatOpen = false)}
  />
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
