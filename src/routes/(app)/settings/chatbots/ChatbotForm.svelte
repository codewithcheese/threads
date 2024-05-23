<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Label } from "$components/ui/label";
  import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
  } from "$components/ui/select";
  import { EditorView } from "@codemirror/view";
  import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
  import { languages } from "@codemirror/language-data";
  import CodeMirror from "svelte-codemirror-editor";
  import type { Chatbot } from "$database/schema";
  import { nanoid } from "nanoid";
  import { TrashIcon, XIcon } from "lucide-svelte";
  import { blankChatbot } from "./$data";

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

  let { onSubmit, chatbot = $bindable(blankChatbot()) }: Props = $props();

  $inspect(chatbot);

  function handleSubmit(e: any) {
    e.preventDefault();
    onSubmit(chatbot);
  }

  function handleAddMessage(e: any) {
    e.preventDefault();
    console.log("handleAddMessage");
    const role =
      chatbot.messages.length === 0
        ? "system"
        : chatbot.messages[chatbot.messages.length - 1].role === "user"
          ? "assistant"
          : "user";
    chatbot.messages.push({
      role,
      content: "",
    });
    console.log("chatbot", chatbot);
  }

  function handleDeleteMessage(e: any) {
    e.preventDefault();
    console.log("handleDeleteMessage");
    chatbot.messages.pop();
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
    {#if chatbot.messages.length > 0}
      <Label for="name">Messages</Label>
      {#each chatbot.messages as message, index (index)}
        <div class="flex flex-row items-center justify-between">
          <Select selected={{ value: message.role, label: message.role }}>
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              {#each ["system", "user", "assistant"] as role}
                <SelectItem value={role} label={role}>{role}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
          <Button variant="ghost" onclick={handleDeleteMessage}>
            <TrashIcon size="16" class="text-gray-500" />
          </Button>
        </div>
        <CodeMirror
          class="flex-1 rounded border border-gray-200"
          bind:value={message.content}
          {extensions}
        />
      {/each}
    {/if}
    <Button onclick={handleAddMessage} variant="outline">Add message</Button>
  </div>
  <div class="mt-4">
    <Button type="submit">Submit</Button>
  </div>
</form>
