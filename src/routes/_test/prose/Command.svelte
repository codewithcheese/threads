<script lang="ts">
  import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "$components/ui/command";
  import { cn } from "$lib/cn";

  type Props = {
    open: boolean;
    placeholder: string;
    suggestions: { name: string }[];
    filter: string | undefined;
  };
  let { placeholder, suggestions, open = false, filter }: Props = $props();
</script>

<Command
  class={cn("max-w-[450px] rounded-lg border shadow-md", !open && "hidden")}
>
  <CommandInput {placeholder} />
  {#if suggestions.length > 0}
    <CommandList>
      <CommandGroup heading="Suggestions">
        {#each suggestions as suggestion}
          <CommandItem>
            <span>{suggestion.name}</span>
          </CommandItem>
        {/each}
      </CommandGroup>
    </CommandList>
  {/if}
</Command>
