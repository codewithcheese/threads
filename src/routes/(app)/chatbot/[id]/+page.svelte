<script lang="ts">
  import { nanoid } from "nanoid";
  import type { Chatbot } from "$database/schema";
  import ChatbotForm from "../ChatbotForm.svelte";
  import toast from "svelte-french-toast";
  import { insertChatbot } from "../$data";
  import { goto } from "$app/navigation";

  let { data } = $props();

  async function handleSubmit(chatbot: Chatbot) {
    try {
      await insertChatbot(chatbot);
    } catch (err) {
      return toast.error(`Failed to create chatbot: ${err}`);
    }
    toast.success("Chatbot created");
    await goto("/chatbot/list");
  }
</script>

<div class="p-4">
  <ChatbotForm chatbot={data.chatbot} onSubmit={handleSubmit} />
</div>
