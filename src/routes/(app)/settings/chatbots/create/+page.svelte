<script lang="ts">
  import { nanoid } from "nanoid";
  import type { Chatbot } from "$database/schema";
  import ChatbotForm from "../ChatbotForm.svelte";
  import toast from "svelte-french-toast";
  import { blankChatbot, insertChatbot } from "../$data";
  import { goto } from "$app/navigation";
  import { Card, CardHeader, CardTitle } from "$components/ui/card";
  import { CardContent } from "$components/ui/card/index.js";

  let chatbot: Chatbot = $state(blankChatbot());

  async function handleSubmit(chatbot: Chatbot) {
    try {
      await insertChatbot(chatbot);
    } catch (err) {
      toast.error(
        `Error creating chatbot: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
    toast.success("Chatbot created");
    await goto("/settings/chatbots");
  }
</script>

<div class="grid gap-6">
  <Card>
    <CardHeader>
      <CardTitle>Create chatbot</CardTitle>
    </CardHeader>
    <CardContent>
      <ChatbotForm bind:chatbot onSubmit={handleSubmit} />
    </CardContent>
  </Card>
</div>
