<script lang="ts">
  import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
  } from "$components/ui/command";
  import { cn } from "$lib/cn";

  let suggestions: string[] = $state([]);

  type Props = {
    class?: string;
    open: boolean;
    // placeholder: string;
    filter: string | undefined;
  };
  let { open, filter, class: className }: Props = $props();
</script>

<Command
  id="suggestions"
  class={cn(
    "absolute max-h-[300px] max-w-[450px] rounded-lg border shadow-md",
    !open && "hidden",
    className,
  )}
>
  {#if suggestions.length > 0}
    <CommandList>
      <CommandGroup heading="Suggestions">
        {#each suggestions as suggestion}
          <CommandItem>
            <span>{suggestion}</span>
          </CommandItem>
        {/each}
      </CommandGroup>
    </CommandList>
  {/if}
</Command>
