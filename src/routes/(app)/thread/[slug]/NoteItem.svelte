<script lang="ts">
  import type { Note } from "$database/schema";
  import { XIcon } from "lucide-svelte";
  import { deleteNote, updateNote } from "./$data";
  import Editor from "./Editor.svelte";
  import { slugify } from "$lib/slugify";

  let {
    note,
    focused,
    onFocus,
  }: { note: Note; focused: boolean; onFocus: () => void } = $props();

  let editing = true;

  let content = $state(note.content);
  $effect(() => {
    content = note.content;
  });

  let parsedContent = $derived(parseContent(content));

  function parseContent(content: string) {
    return content.replace(
      /\[\[([^\]]+)]]/g,
      (_, text) =>
        `<a class="page-link" href="/thread/${slugify(text)}">${text}</a>`,
    );
  }

  async function handleDelete() {
    await deleteNote(note.id);
  }

  function handleClick() {
    onFocus();
  }

  async function handleSubmit(value: string) {
    await updateNote(note.id, value);
    // editing = false;
  }
</script>

<div class="group flex flex-row items-center gap-1 py-1">
  <div
    class="absolute -ml-8 cursor-pointer pr-4 text-gray-500 opacity-0 group-hover:opacity-100"
  >
    <XIcon onclick={handleDelete} size={16} />
  </div>
  <div class="w-full" onclick={handleClick}>
    {#if editing}
      <Editor bind:content onSubmit={handleSubmit} />
    {:else}
      {@html parsedContent}
    {/if}
  </div>
</div>

<style lang="postcss">
  :global(.page-link) {
    @apply text-blue-500 underline;
  }
</style>
