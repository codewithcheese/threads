<script lang="ts">
  import { goto, invalidate } from "$app/navigation";
  import { createChat, deleteNote } from "./$data.js";
  import { MessageCircleIcon, XIcon } from "lucide-svelte";
  import { page } from "$app/stores";
  import { useDb } from "$database";
  import { desc } from "drizzle-orm";
  import { chatTable } from "$database/schema";
  import { Button } from "$components/ui/button";
  import NoteWidget from "./NoteWidget.svelte";
  import { nanoid } from "nanoid";
  import { cn } from "$lib/cn";

  let { data } = $props();

  let focusIndex = $state(0);

  async function handleDelete(id: string) {
    await deleteNote(id);
    await invalidate("view:notes");
  }

  async function handleSubmit(index: number) {
    console.log("handleSubmit", index);
    if (index + 1 >= data.notes.length) {
      data.notes.push({
        id: nanoid(10),
        content: "",
        labels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    focusIndex = index + 1;
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
      <div class="flex flex-row items-center py-1">
        <div
          class={cn(
            "-ml-8 cursor-pointer pr-4 text-gray-500",
            focusIndex === index ? "opacity-100" : "opacity-0",
          )}
        >
          <XIcon onclick={() => handleDelete(note.id)} size={16} />
        </div>
        <div class="w-full">
          <NoteWidget
            focused={focusIndex === index}
            onSubmit={() => handleSubmit(index)}
            {note}
          />
        </div>
      </div>
    {/each}
  </div>
</main>
<!--<div class="sticky bottom-0 mx-auto w-[100ch] pb-4 pt-2">-->
<!--  <Card>-->
<!--    <CardContent class="p-2">-->
<!--      <NoteWidget />-->
<!--    </CardContent>-->
<!--  </Card>-->
<!--</div>-->
<slot />
