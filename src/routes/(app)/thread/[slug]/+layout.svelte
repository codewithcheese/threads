<script lang="ts">
  import NoteItem from "./NoteItem.svelte";
  import Editor from "./Editor.svelte";
  import { goto, invalidate } from "$app/navigation";
  import { createChat, submitNote } from "./$data.js";
  import { MessageCircleIcon } from "lucide-svelte";
  import { page } from "$app/stores";
  import { useDb } from "$database";
  import { desc } from "drizzle-orm";
  import { chatTable } from "$database/schema";
  import { Button } from "$components/ui/button";
  import { Card, CardContent } from "$components/ui/card";

  let { data } = $props();

  let content = $state("");
  let reset = $state(false);
  let focusIndex: number = $state(-1);

  async function handleSubmit(value: string) {
    console.log("submitting", value);
    await submitNote(value);
    await invalidate("view:notes");
  }

  $inspect(content);

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

<div class="mx-auto flex w-[100ch] flex-row items-center gap-2 pb-2 pt-2">
  <h1 class="shrink-0 whitespace-nowrap text-3xl font-semibold tracking-tight">
    {data.pageName}
  </h1>
  <Button variant="ghost" class="cursor-pointer" onclick={handleChatClick}>
    <MessageCircleIcon size="24" class="text-gray-700" />
  </Button>
</div>
<main class="flex flex-1 flex-col overflow-y-auto">
  <div class="mx-auto w-[100ch]">
    {#each data.notes as note, index (note.id)}
      <NoteItem
        onFocus={() => (focusIndex = index)}
        focused={focusIndex === index}
        {note}
      />
    {/each}
  </div>
</main>
<div class="sticky bottom-0 mx-auto w-[100ch] pb-4 pt-2">
  <Card>
    <CardContent class="p-2">
      <Editor resetOnSubmit={true} bind:content onSubmit={handleSubmit} />
    </CardContent>
  </Card>
</div>

<slot />

<style lang="postcss">
  :global(html) {
    background-color: theme(colors.gray.100);
  }
</style>
