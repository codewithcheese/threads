<script lang="ts">
  import { HashIcon } from "lucide-svelte";

  let { value = "Hello word" } = $props();

  function handleClick() {
    console.log("click");
  }
</script>

<button
  class="mx-0.5 flex cursor-pointer flex-row items-center space-x-1 rounded bg-purple-50 px-1 hover:bg-purple-200"
  onclick={handleClick}
>
  <span class="flex flex-row items-center">
    <span class="group-hover:hidden">
      <HashIcon class="h-3 w-3" />
    </span>
    <span>{value}</span>
  </span>
</button>

<style>
  :global(.tag) {
    @apply inline-flex items-center;
  }
</style>
