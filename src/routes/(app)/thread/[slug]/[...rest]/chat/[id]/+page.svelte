<script lang="ts">
  import { Card, CardContent } from "$components/ui/card";
  import Editor from "../../../Editor.svelte";
  import toast from "svelte-french-toast";
  import type { Mention } from "$lib/prosemirror/schema";

  let { data } = $props();
  let messages = $derived(data.chat.messages);

  let previousRecipients = $derived.by((): string[] => {
    // listen is the last recipient
    const previousMessage = messages.findLast(
      (m) => m.role === "user" && m.recipients.length > 0,
    );
    return previousMessage != null ? previousMessage.recipients : [];
  });

  function handleSubmit(value: string, mentions: Mention[]) {
    const to = mentions.length > 0 ? mentions : previousRecipients;
    if (to.length === 0) {
      toast.error(
        "No chatbot will receive your message. Use an @ mention to invite a chatbot.",
      );
      return false;
    }
  }
</script>

<div class="border border-gray-200">
  {#each data.chat.messages as message, index (message.id)}
    <div>{message.content}</div>
  {/each}
  <div class="sticky bottom-0 mx-auto w-[100ch] pb-4 pt-2">
    <Card>
      <CardContent class="p-2">
        <Editor
          content=""
          resetOnSubmit={true}
          onSubmit={handleSubmit}
          onLabelSubmit={() => {}}
          onCommandSubmit={() => {}}
        />
      </CardContent>
    </Card>
  </div>
</div>
