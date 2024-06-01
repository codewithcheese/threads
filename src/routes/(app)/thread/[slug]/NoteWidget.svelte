<script lang="ts">
  import type { Note } from "$database/schema";
  import { upsertNote } from "./$data";
  import Editor from "./Editor.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { nanoid } from "nanoid";
  import { slugify } from "$lib/slugify";
  import { Button } from "$components/ui/button";

  type Command = "youtube" | "image";

  let {
    note,
    focused = false,
    onFocus = () => {},
    onSubmit = () => {},
  }: {
    note?: Note;
    focused?: boolean;
    onFocus?: () => void;
    onSubmit: () => void;
  } = $props();

  let activeNote = $derived(note ? note : emptyNote());
  let command: Command | null = $state(null);

  function emptyNote(): Note {
    return {
      id: nanoid(10),
      content: "",
      labels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // function handleClick() {
  //   onFocus();
  // }

  async function handleSubmit(value: string) {
    activeNote.content = value;
    await upsertNote(activeNote);
    await invalidate("view:notes");
    onSubmit();
  }

  async function handleLabelSubmit(label: string) {
    activeNote.labels.push(label);
    await upsertNote(activeNote);
    await invalidate("view:notes");
  }

  function handleCommandSubmit(value: string) {
    console.log("handleCommandSubmit", value);
    // @ts-ignore
    command = value;
  }

  async function handleLabelClick(label: string) {
    await goto(`/thread/${slugify(label)}`);
  }
</script>

<Editor
  {focused}
  content={activeNote.content}
  onSubmit={handleSubmit}
  onLabelSubmit={handleLabelSubmit}
  onCommandSubmit={handleCommandSubmit}
/>
{#if command === "youtube"}
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

<style lang="postcss">
  :global(.page-link) {
    @apply text-blue-500 underline;
  }
</style>
