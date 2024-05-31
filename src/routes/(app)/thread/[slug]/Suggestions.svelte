<script lang="ts">
  import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "$components/ui/command";
  import { cn } from "$lib/cn";
  import { suggestLabels } from "./$data";

  let suggestions: string[] = $state([]);

  type Props = {
    class?: string;
    open: boolean;
    // placeholder: string;
    filter: string | undefined;
  };
  let { open, filter, class: className }: Props = $props();

  $effect(() => {
    if (open) {
      (async () => {
        if (filter) {
          suggestions = await suggestLabels(filter);
        }
      })();
    }
  });
</script>

<Command
  id="suggestions"
  class={cn(
    "absolute max-h-[300px] max-w-[450px] rounded-lg border shadow-md",
    !open && "hidden",
    className,
  )}
>
  <CommandInput readonly={true} placeholder="Enter tag name" value={filter} />
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
