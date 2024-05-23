<script lang="ts">
  import { Toaster } from "svelte-french-toast";
  import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
  } from "$components/ui/breadcrumb";
  import { page } from "$app/stores";
  import { SettingsIcon } from "lucide-svelte";
  import { Button } from "$components/ui/button";
</script>

<Toaster />
<div class="flex h-full flex-col">
  <header
    class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 pt-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
  >
    <Breadcrumb class="flex-1">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/thread/recent">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {#each $page.data.breadcrumbs as crumb, index}
          <BreadcrumbItem>
            <BreadcrumbLink href={crumb.url}>{crumb.title}</BreadcrumbLink>
          </BreadcrumbItem>
          {#if index < $page.data.breadcrumbs.length - 1}
            <BreadcrumbSeparator />
          {/if}
        {/each}
      </BreadcrumbList>
    </Breadcrumb>
    <Button
      href="/settings"
      variant="ghost"
      class="text-gray-500 hover:bg-transparent hover:text-black"
    >
      <SettingsIcon />
    </Button>
  </header>

  <slot />
</div>
