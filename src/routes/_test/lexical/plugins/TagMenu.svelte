<script lang="ts">
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
  } from "$components/ui/command";
  import TypeaheadPlugin from "./TypeaheadPlugin.svelte";
  import { basicTypeaheadTriggerMatch, type MenuResolution } from "./Typeahead";
  import type { LexicalEditor } from "lexical";
  import { cn } from "$lib/cn";

  const tagTriggerFn = basicTypeaheadTriggerMatch("#", { minLength: 0 });

  let { editor }: { editor: LexicalEditor } = $props();
  let query: string | null = $state(null);
  let open = $state(false);
  let resolution: MenuResolution | null = $state(null);
  let selected: string = $state("");
  let options = [{ name: "tag1" }, { name: "tag2" }];

  $effect(() => {
    if (query) {
      console.log("search for related tags");
    }
  });
</script>

<TypeaheadPlugin
  {editor}
  triggerFn={tagTriggerFn}
  onQueryChange={(q) => (query = q)}
  onOpen={(res) => {
    resolution = res;
    open = true;
  }}
  onClose={() => (open = false)}
/>

{#if open}
  <Command
    id="tag-menu"
    class={cn(
      "absolute max-h-[300px] max-w-[450px] rounded-lg border shadow-md",
    )}
    value={selected}
  >
    <CommandList>
      {#if query}
        <CommandGroup heading={`Create new tag`}>
          <CommandItem value={query}>
            <span>{query}</span>
          </CommandItem>
        </CommandGroup>
      {/if}
      {#each options as option (option.name)}
        <CommandItem value={option.name}>
          <span>{option.name}</span>
        </CommandItem>
      {/each}
    </CommandList>
  </Command>
{/if}
