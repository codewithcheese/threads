<script lang="ts">
  import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
  } from "$components/ui/table/index";
  import { Button } from "$components/ui/button/index";
  import { PlusIcon, TrashIcon } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import DeleteDialog from "$components/DeleteDialog.svelte";
  import { type Chatbot, chatbotTable } from "$database/schema";
  import { invalidateModel } from "$database";
  import { deleteChatbot } from "../$data";
  import toast from "svelte-french-toast";

  let { data } = $props();

  let chatbotToDelete: Chatbot | null = $state(null);

  async function handleDelete() {
    if (!chatbotToDelete) {
      return;
    }
    try {
      const chatbotId = chatbotToDelete.id;
      await deleteChatbot(chatbotId);
      await invalidateModel(chatbotTable, { id: chatbotId });
      toast.success("Chatbot deleted");
    } catch (err) {
      toast.error(`Failed to delete chatbot: ${err}`);
    }
  }
</script>

<main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
  <div class="flex items-center">
    <h1 class="flex-1 text-lg font-semibold md:text-2xl">Chatbots</h1>
    <Button href="/chatbot/create" variant="default">
      <PlusIcon class="mr-2 h-4 w-4" />
      Add chatbot
    </Button>
  </div>
  {#if data.chatbots.length === 0}
    <div class="flex flex-col gap-1">
      <h3 class="text-lg font-semibold tracking-tight">You have no chatbots</h3>
      <p class="text-sm text-muted-foreground">
        <a class="underline" href="/chatbot/create"
          >Click to add your first chatbot</a
        >
      </p>
    </div>
  {:else}
    <Table class="overflow-y-auto">
      <TableHeader>
        <TableCell class="p-2 font-semibold">Name</TableCell>
        <TableCell class="p-2 font-semibold">Description</TableCell>
        <TableCell></TableCell>
      </TableHeader>
      <TableBody>
        {#each data.chatbots as chatbot (chatbot.id)}
          <TableRow
            class="group cursor-pointer text-muted-foreground hover:text-primary"
          >
            <TableCell
              onclick={() => {
                console.log("name clicked", chatbot.name);
                goto(`/chatbot/${chatbot.id}`);
              }}
              class="p-2 "
            >
              {chatbot.name}
            </TableCell>
            <TableCell
              onclick={() => {
                console.log("description clicked", chatbot.description);
                goto(`/chatbot/${chatbot.id}`);
              }}
              class="p-2 "
            >
              {chatbot.description}
            </TableCell>
            <TableCell class="p-2">
              <Button
                onclick={() => {
                  chatbotToDelete = chatbot;
                }}
                variant="ghost"
                class="p-1 px-4 text-sm opacity-0 group-hover:opacity-100"
              >
                <TrashIcon class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  {/if}
</main>
{#if chatbotToDelete}
  <DeleteDialog
    name={chatbotToDelete.name}
    type="chatbot"
    onConfirm={handleDelete}
    onCancel={() => {
      console.log("cancel");
      chatbotToDelete = null;
    }}
  />
{/if}
