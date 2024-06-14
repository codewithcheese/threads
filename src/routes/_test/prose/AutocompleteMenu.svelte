<script lang="ts">
  import {
    Command,
    CommandEmpty,
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
  import { commands, triggers } from "./$autocomplete";
  import toast from "svelte-french-toast";

  type Option = {
    id: string;
    name: string;
    group: string;
    visible?: boolean;
  };

  type Props = {
    action: AutocompleteAction | null;
    onSubmit: (type: string, id: string) => void;
  };
  let { action, onSubmit }: Props = $props();

  let open = $derived(action && action.kind !== ActionKind.close);
  let filter = $derived((action && action.filter) || "");
  let trigger = $derived(triggers.find((t) => t.name === action?.type?.name));

  $inspect("trigger", trigger);

  let options: Option[] = $state([]);
  let optionsGrouped = $derived.by(() => {
    let grouped: Record<string, Option[]> = {};
    for (const suggestion of options) {
      if (!suggestion.visible) {
        continue;
      }
      if (!grouped[suggestion.group]) {
        grouped[suggestion.group] = [];
      }
      grouped[suggestion.group].push(suggestion);
    }
    return grouped;
  });

  let value: string | undefined = $state(undefined);

  $effect(() => {
    if (action) {
      untrack(() => handleActionUpdate(action!));
    }
  });

  function updateVisibleOptions() {
    for (const option of options) {
      option.visible = option.name.toLowerCase().includes(filter.toLowerCase());
    }
  }

  function handleActionUpdate(action: AutocompleteAction) {
    if (open) {
      fetchOptions(action!.type?.name!);
      updateVisibleOptions();
      updateSelectedValue();
      moveAutocompleteMenu();
    }
    if (trigger && trigger.allowNewValues && action?.filter) {
      value = action.filter;
    }
    if (action && action.kind === ActionKind.enter) {
      if (trigger && trigger.allowNewValues) {
        if (!value && !filter) {
          return;
        }
        onSubmit(action.type?.name!, value ?? filter);
      } else if (trigger && !trigger.allowNewValues) {
        if (!value) {
          toast.error("No option selected");
          return;
        }
        onSubmit(action.type?.name!, value);
      }
    }
  }

  async function fetchOptions(type: string) {
    switch (type) {
      case "tag": {
        options = await getMatchingLabels(filter || "");
        break;
      }
      case "command": {
        options = commands;
        break;
      }
      default: {
        options = [];
        break;
      }
    }
    if (!options.find((s) => s.id === value)) {
      value = undefined;
    }
  }

  function moveAutocompleteMenu() {
    const suggestion = document.querySelector(
      "#autocomplete-menu",
    ) as HTMLDivElement;
    const rect = document
      .querySelector(".autocomplete")
      ?.getBoundingClientRect();
    if (!rect) return;
    suggestion.style.top = `${rect.top + rect.height}px`;
    suggestion.style.left = `${rect.left}px`;
  }

  function updateSelectedValue() {
    let startIndex = options.findIndex((s) => s.id === value);
    if (action?.kind === ActionKind.up) {
      let previousSuggestion = options.findLast(
        (s, index) => index < startIndex && s.visible === true,
      );
      if (previousSuggestion) {
        value = previousSuggestion.id;
      }
    }
    if (action?.kind === ActionKind.down) {
      let nextSuggestion = options.find(
        (s, index) => index > startIndex && s.visible === true,
      );
      if (nextSuggestion) {
        value = nextSuggestion.id;
      }
    }
  }
</script>

{#if open}
  <Command
    id="autocomplete-menu"
    class={cn(
      "absolute max-h-[300px] max-w-[450px] rounded-lg border shadow-md",
    )}
    {value}
  >
    <CommandList>
      {#if trigger && trigger.allowNewValues && filter}
        <CommandGroup heading={`Create new ${trigger.name}`}>
          <CommandItem value={filter}>
            <span>{filter}</span>
          </CommandItem>
        </CommandGroup>
      {:else if trigger && !trigger.allowNewValues && Object.keys(optionsGrouped).length === 0}
        <CommandEmpty>
          No matching {trigger ? `${trigger.name}s` : "suggestions"}.
        </CommandEmpty>
      {/if}
      {#each Object.entries(optionsGrouped) as [group, items]}
        <CommandGroup heading={group}>
          {#each items as suggestion (suggestion.id)}
            <CommandItem value={suggestion.id}>
              <span>{suggestion.name}</span>
            </CommandItem>
          {/each}
        </CommandGroup>
      {/each}
    </CommandList>
  </Command>
{/if}
