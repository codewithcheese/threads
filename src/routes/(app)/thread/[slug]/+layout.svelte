<script lang="ts">
  import NoteItem from "./NoteItem.svelte";
  import Editor from "./Editor.svelte";
  import { invalidate } from "$app/navigation";
  import { submitNote } from "./$data.js";

  let { data } = $props();

  let content = $state("");
  let focusIndex: number = $state(-1);

  async function handleSubmit(value: string) {
    console.log("submitting", value);
    await submitNote(value);
    content = "";
    await invalidate("view:notes");
  }
</script>

<div class="mx-auto mt-10 grid max-w-[59rem] flex-1 auto-rows-max">
  <h1
    class="mb-6 flex-1 shrink-0 whitespace-nowrap text-3xl font-semibold tracking-tight sm:grow-0"
  >
    {data.pageName}
  </h1>

  <div class="py-1">
    <Editor bind:content onSubmit={handleSubmit} />
  </div>

  {#each data.notes as note, index (note.id)}
    <NoteItem
      onFocus={() => (focusIndex = index)}
      focused={focusIndex === index}
      {note}
    />
  {/each}
</div>
<slot />

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
