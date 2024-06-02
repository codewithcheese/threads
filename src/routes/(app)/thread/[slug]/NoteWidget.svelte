<script lang="ts">
  import type { Note } from "$database/schema";
  import { upsertNote } from "./$data";
  import Editor from "./Editor.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { nanoid } from "nanoid";
  import { slugify } from "$lib/slugify";
  import { Button } from "$components/ui/button";

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
  let activeTool: string | null = $state(null);

  function emptyNote(): Note {
    return {
      id: nanoid(10),
      content: "",
      labels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

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

  function handleToolSubmit(toolId: string) {
    console.log("handleToolSubmit", toolId);
    // @ts-ignore
    activeTool = toolId;
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
  onToolSubmit={handleToolSubmit}
/>
{#if activeTool === "youtube"}
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
