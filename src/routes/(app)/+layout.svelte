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
</script>

<Toaster />
<div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-4">
  <header
    class="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
  >
    <Breadcrumb>
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
  </header>
  <main class="px-4 sm:px-6">
    <slot />
  </main>
</div>
