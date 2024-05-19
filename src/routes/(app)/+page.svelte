<script lang="ts">
  import type { Note } from "$database/schema";
  import Editor from "./Editor.svelte";
  import { submitNote } from "./$data";

  let { data } = $props();

  let content = $state("");
</script>

<div class="container mx-auto max-w-7xl px-4">
  <Editor {content} onSubmit={(value) => submitNote(value)} />
  {#each data.notes as note (note.id)}
    <div>{note.content}</div>
  {/each}
</div>

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
