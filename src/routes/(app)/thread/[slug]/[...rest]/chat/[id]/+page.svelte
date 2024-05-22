<script lang="ts">
  import {
    Sheet,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
    SheetContent,
    SheetHeader,
  } from "$components/ui/sheet";
</script>

<Sheet open={true}>
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
