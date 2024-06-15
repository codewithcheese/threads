<script lang="ts">
  import { cn } from "$lib/utils";
  let { type, selected }: { type: string; selected: boolean } = $props();
</script>

<div class={cn(selected && "bg-purple-200")}>
  {#if type === "youtube-video"}{/if}
</div>
