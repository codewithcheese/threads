<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import { EditorView } from "@codemirror/view";
  import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
  import { languages } from "@codemirror/language-data";
  import CodeMirror from "svelte-codemirror-editor";
  import { nanoid } from "nanoid";
  import type { Chatbot } from "$database/schema";

  const extensions = [
    EditorView.lineWrapping,
    markdown({
      base: markdownLanguage,
      codeLanguages: languages,
    }),
  ];

  type Props = {
    onSubmit: (e: any) => void;
    chatbot: Chatbot;
  };

  let { onSubmit, chatbot }: Props = $props();

  function handleSubmit(e: any) {
    e.preventDefault();
    onSubmit(chatbot);
  }
</script>

<form class="max-w-[100ch] space-y-6" onsubmit={handleSubmit}>
  <div class="space-y-2">
    <Label for="name">Name</Label>
    <Input
      bind:value={chatbot.name}
      id="name"
      placeholder="Enter name"
      type="text"
    />
    <p class="text-xs text-muted-foreground">Name to identify the chatbot.</p>
  </div>
  <div class="space-y-2">
    <Label for="name">Description</Label>
    <Input
      bind:value={chatbot.description}
      id="description"
      placeholder="Enter description"
      type="text"
    />
    <p class="text-xs text-muted-foreground">
      Describe what the chatbot can help you with.
    </p>
  </div>
  <div class="space-y-2">
    <Label for="name">Messages</Label>
    {#if chatbot.messages.length > 0}
      {#each chatbot.messages as message}
        <CodeMirror
          class="rounded border border-gray-200"
          bind:value={message.content}
          {extensions}
        />
      {/each}
    {/if}
    <div class="space-y-2">
      <Button type="submit">Submit</Button>
    </div>
  </div>
</form>
