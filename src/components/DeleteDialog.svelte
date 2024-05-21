<script lang="ts">
  import { TrashIcon } from "lucide-svelte";
  import { Button } from "$components/ui/button/index.js";
  import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
  } from "$components/ui/dialog/index.js";

  function capitalizeWords(text: string): string {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  type Props = {
    name: string;
    type: string;
    onConfirm: () => void;
    onCancel: () => void;
  };
  let { name, type, onConfirm, onCancel }: Props = $props();
</script>

<Dialog open onOpenChange={onCancel}>
  <DialogTrigger asChild let:builder>
    <Button
      builders={[builder]}
      variant="ghost"
      class="p-1 px-4 text-sm opacity-0 group-hover:opacity-100"
    >
      <TrashIcon class="h-4 w-4" />
    </Button>
  </DialogTrigger>
  <DialogContent class="max-w-[400px]">
    <DialogTitle>Delete {capitalizeWords(type)}</DialogTitle>
    <DialogDescription class="space-y-2">
      <p>Are you sure you want to delete this {type}?</p>
      <p>
        {capitalizeWords(type)} to be deleted:
        <span class="font-semibold">{name}</span>
      </p>
      <p>This action cannot be undone.</p>
    </DialogDescription>
    <DialogClose>
      <Button
        class="w-full"
        variant="destructive"
        onclick={() => {
          onConfirm();
        }}
      >
        Delete
      </Button>
    </DialogClose>
  </DialogContent>
</Dialog>
