<script lang="ts">
  import { nanoid } from "nanoid";
  import type { Chatbot } from "$database/schema";
  import ChatbotForm from "../ChatbotForm.svelte";
  import toast from "svelte-french-toast";
  import { insertChatbot } from "../$data";
  import { goto } from "$app/navigation";

  const chatbot: Chatbot = {
    id: nanoid(10),
    name: "",
    description: "",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  async function handleSubmit(chatbot: Chatbot) {
    try {
      await insertChatbot(chatbot);
    } catch (err) {
      toast.error(
        `Error creating chatbot: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
    toast.success("Chatbot created");
    await goto("/chatbot/list");
  }
</script>

<div class="p-4">
  <ChatbotForm {chatbot} onSubmit={handleSubmit} />
</div>
