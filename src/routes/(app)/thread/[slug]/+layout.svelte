<script lang="ts">
  import NoteItem from "./NoteItem.svelte";
  import Editor from "./Editor.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { createChat, submitNote } from "./$data.js";
  import { MessageCircleIcon, MessageCirclePlusIcon } from "lucide-svelte";
  import { page } from "$app/stores";
  import { useDb } from "$database";
  import { desc } from "drizzle-orm";
  import { chatTable } from "$database/schema";

  let { data } = $props();

  let content = $state("");
  let focusIndex: number = $state(-1);

  async function handleSubmit(value: string) {
    console.log("submitting", value);
    await submitNote(value);
    content = "";
    await invalidate("view:notes");
  }

  async function handleChatClick() {
    // fetch previous chat
    const chat = await useDb().query.chatTable.findFirst({
      orderBy: desc(chatTable.createdAt),
    });
    if (chat) {
      await goto(`/thread/${$page.params.slug}/chat/${chat.id}`);
      return;
    }

    // otherwise create new chat
    const id = await createChat($page.params.slug);
    await goto(`/thread/${$page.params.slug}/chat/${id}`);
  }
</script>

<div class="mx-auto mt-10 grid max-w-[59rem] flex-1 auto-rows-max">
  <div class="mb-6 flex flex-row items-center gap-4">
    <h1
      class="shrink-0 whitespace-nowrap text-3xl font-semibold tracking-tight"
    >
      {data.pageName}
    </h1>
    <div class="cursor-pointer" onclick={handleChatClick}>
      <MessageCircleIcon size="24" class="text-gray-700" />
    </div>
  </div>

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
