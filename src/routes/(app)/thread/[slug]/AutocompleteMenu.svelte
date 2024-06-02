<script lang="ts">
  import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
  } from "$components/ui/command";
  import { cn } from "$lib/cn";
  import {
    ActionKind,
    type AutocompleteAction,
  } from "prosemirror-autocomplete";
  import { getMatchingLabels } from "./$data";
  import { untrack } from "svelte";

  type Props = {
    action: AutocompleteAction | null;
    onSubmit: (type: string, selected: Suggestion) => void;
  };
  let { action, onSubmit }: Props = $props();

  type Suggestion = { id: string; name: string };

  let open = $derived(action && action.kind !== ActionKind.close);
  let filter = $derived((action && action.filter) || "");
  let title = $derived.by(() => {
    switch (action && action.type?.name) {
      case "hashtag":
        return "Labels";
      case "tool":
        return "Tools";
      default:
        return "Suggestions";
    }
  });
  let suggestions: Suggestion[] = $state([]);
  let activeSuggestions: Suggestion[] = $derived(
    suggestions.filter((s) =>
      s.name.toLowerCase().includes(filter.toLowerCase()),
    ),
  );
  let value: string | undefined = $state(undefined);

  $effect(() => {
    console.log("action effect", action);
    if (action) {
      untrack(() => {
        if (open) {
          updateSelectedIndex();
          updateSuggestions(action!.type?.name!);
          moveSuggestions();
        }
        if (action && value && action.kind === ActionKind.enter) {
          onSubmit(
            action.type?.name!,
            activeSuggestions.find((s) => s.id === value)!,
          );
        }
      });
    }
  });

  async function updateSuggestions(type: string) {
    switch (type) {
      case "hashtag": {
        suggestions = await getMatchingLabels(filter || "");
        break;
      }
      case "tool": {
        suggestions = [
          { id: "youtube-video", name: "Insert YouTube Video" },
          { id: "chat", name: "New Chat" },
        ];
        break;
      }
      default: {
        suggestions = [];
        break;
      }
    }
    if (!suggestions.find((s) => s.id === value)) {
      value = undefined;
    }
  }

  function moveSuggestions() {
    const suggestion = document.querySelector("#suggestions") as HTMLDivElement;
    const rect = document
      .querySelector(".autocomplete")
      ?.getBoundingClientRect();
    if (!rect) return;
    suggestion.style.top = `${rect.top + rect.height}px`;
    suggestion.style.left = `${rect.left}px`;
  }

  function updateSelectedIndex() {
    if (action?.kind === ActionKind.up || action?.kind === ActionKind.down) {
      if (activeSuggestions.length === 0) return;
      let index = activeSuggestions.findIndex((s) => s.id === value);
      index =
        action?.kind === ActionKind.up
          ? Math.max(index - 1, 0)
          : Math.min(index + 1, activeSuggestions.length - 1);
      value = activeSuggestions[index].id;
    }
  }

  $inspect("action", action, value);
</script>

{#if open}
  <div>{open}</div>
  <Command
    id="suggestions"
    class={cn(
      "absolute max-h-[300px] max-w-[450px] rounded-lg border shadow-md",
    )}
    {value}
    onValueChange={(value) => {
      console.log("onSelect", value);
    }}
  >
    {#if activeSuggestions.length > 0}
      <CommandList>
        <CommandGroup heading={title}>
          {#each activeSuggestions as suggestion}
            <CommandItem value={suggestion.id}>
              <span>{suggestion.name}</span>
            </CommandItem>
          {/each}
        </CommandGroup>
      </CommandList>
    {/if}
  </Command>
{/if}
