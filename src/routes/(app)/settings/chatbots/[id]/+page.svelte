<script lang="ts">
  import type { Chatbot } from "$database/schema";
  import ChatbotForm from "../ChatbotForm.svelte";
  import toast from "svelte-french-toast";
  import { updateChatbot } from "../$data";
  import { goto } from "$app/navigation";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "$components/ui/card";

  let { data } = $props();

  async function handleSubmit(chatbot: Chatbot) {
    try {
      await updateChatbot(chatbot);
    } catch (err) {
      return toast.error(`Failed to create chatbot: ${err}`);
    }
    toast.success(`Chatbot ${data.chatbot.name} updated`);
    await goto("/settings/chatbots");
  }
</script>

<div class="grid gap-6">
  <Card>
    <CardHeader>
      <CardTitle>Update chatbot</CardTitle>
    </CardHeader>
    <CardContent>
      <ChatbotForm bind:chatbot={data.chatbot} onSubmit={handleSubmit} />
    </CardContent>
  </Card>
</div>
