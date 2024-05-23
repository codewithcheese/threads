<script lang="ts">
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$components/ui/table/index";
  import DeleteDialog from "$components/DeleteDialog.svelte";
  import { type Chatbot, chatbotTable } from "$database/schema";
  import { invalidateModel } from "$database";
  import { deleteChatbot } from "./$data";
  import toast from "svelte-french-toast";
  import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "$components/ui/card";
  import { PlusIcon, TrashIcon } from "lucide-svelte";
  import { Button } from "$components/ui/button";
  import { goto } from "$app/navigation";

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

<div class="grid gap-6">
  <Card>
    <CardHeader class="flex flex-row">
      <div class="grid gap-2">
        <CardTitle>Chatbots</CardTitle>
        <CardDescription>Your minions.</CardDescription>
      </div>
      <Button href="/settings/chatbots/create" size="sm" class="ml-auto gap-1">
        Add chatbot
        <PlusIcon class="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent>
      {#if data.chatbots.length === 0}
        <div class="text-sm">You have no chatbots, add one to get started.</div>
      {:else}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>
                <span class="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each data.chatbots as chatbot (chatbot.id)}
              <TableRow>
                <TableCell
                  class="cursor-pointer font-medium"
                  onclick={async () => {
                    console.log("click", `/settings/chatbots/${chatbot.id}`);
                    await goto(`/settings/chatbots/${chatbot.id}`);
                  }}
                >
                  {chatbot.name}
                </TableCell>
                <TableCell
                  class="cursor-pointer"
                  onclick={() => goto(`/settings/chatbots/${chatbot.id}`)}
                >
                  {chatbot.description}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="text-gray-500 hover:bg-transparent hover:text-black"
                    onclick={() => (chatbotToDelete = chatbot)}
                  >
                    <TrashIcon size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      {/if}
    </CardContent>
    {#if data.chatbots.length > 0}
      <CardFooter>
        <div class="text-xs text-muted-foreground">
          Showing <strong>1-{data.chatbots.length}</strong> of
          <strong>{data.chatbots.length}</strong> chatbots
        </div>
      </CardFooter>
    {/if}
  </Card>
</div>

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
