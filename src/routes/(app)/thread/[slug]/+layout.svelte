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
  let focusLeft: number | undefined = $state(undefined);
  let focusDirection: "top" | "bottom" | undefined = $state(undefined);

  async function handleDelete(id: string) {
    await deleteNote(id);
    await invalidate("view:notes");
  }

  async function handleSubmit(index: number) {
    console.log("handleSubmit", index);
    if (index + 1 >= data.notes.length) {
      data.notes.push({
        note: {
          id: nanoid(10),
          content: "",
          labels: [],
          chatId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
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

  function handleWidgetClick(index: number) {
    console.log("handleWidgetClick", index);
    focusIndex = index;
  }

  function handleOnFocus(index: number) {
    focusIndex = index;
  }

  function handleOnFocusPrevious(index: number, left: number) {
    if (index > 0) {
      focusIndex = index - 1;
      focusLeft = left;
      focusDirection = "bottom";
    }
  }

  function handleOnFocusNext(index: number, left: number) {
    if (index < data.notes.length - 1) {
      focusIndex = index + 1;
      focusLeft = left;
      focusDirection = "top";
    }
  }
</script>

<div class="mx-auto mt-10 flex w-[100ch] flex-row items-center gap-2 pb-2">
  <h1 class="shrink-0 whitespace-nowrap text-3xl font-semibold tracking-tight">
    {data.labelName}
  </h1>
  <Button variant="ghost" class="cursor-pointer" onclick={handleChatClick}>
    <MessageCircleIcon size="24" class="text-gray-700" />
  </Button>
</div>
<main class="flex flex-1 flex-col overflow-y-auto">
  <div class="mx-auto w-[100ch]">
    {#each data.notes as { note }, index (note.id)}
      <div class="flex flex-row py-1">
        <div
          class={cn(
            "-ml-8 cursor-pointer pr-4 pt-1 text-gray-500",
            focusIndex === index ? "opacity-100" : "opacity-0",
          )}
        >
          <XIcon onclick={() => handleDelete(note.id)} size={16} />
        </div>
        <div
          role="listitem"
          class="hover:border-3 w-full hover:border-amber-200"
          onclick={handleWidgetClick.bind(null, index)}
        >
          <NoteWidget
            {focusLeft}
            {focusDirection}
            focused={focusIndex === index}
            onFocus={handleOnFocus.bind(null, index)}
            onFocusPrevious={handleOnFocusPrevious.bind(null, index)}
            onFocusNext={handleOnFocusNext.bind(null, index)}
            onSubmit={handleSubmit.bind(null, index)}
            {note}
          />
        </div>
      </div>
    {/each}
  </div>
</main>
<slot />
