<script lang="ts">
  import NoteItem from "../NoteItem.svelte";
  import Editor from "../Editor.svelte";
  import { submitNote } from "../$data";
  import { invalidate } from "$app/navigation";

  let { data } = $props();

  let content = $state("");

  async function handleSubmit(value: string) {
    console.log("submitting", value);
    await submitNote(value);
    content = "";
    await invalidate("view:notes");
  }
</script>

<div class="container mx-auto max-w-7xl px-4">
  <h1>Recent</h1>
  <Editor bind:content onSubmit={handleSubmit} />
  {#each data.notes as note (note.id)}
    <NoteItem {note} />
  {/each}
</div>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
