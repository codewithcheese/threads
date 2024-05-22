<script lang="ts">
  import {
    Sheet,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
    SheetContent,
    SheetHeader,
  } from "$components/ui/sheet";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  async function handleOpenChange(open: boolean) {
    await goto(`/thread/${$page.params.slug}`);
  }
</script>

<Sheet open={true} closeOnOutsideClick={false} onOpenChange={handleOpenChange}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Are you sure absolutely sure?</SheetTitle>
      <SheetDescription>
        This action cannot be undone. This will permanently delete your account
        and remove your data from our servers.
      </SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>
