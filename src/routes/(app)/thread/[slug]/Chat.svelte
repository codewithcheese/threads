<script lang="ts">
  import { Card, CardContent } from "$components/ui/card";

  type Props = {
    id: string;
    onClose: () => void;
  };
  let { id, onClose } = $props();
</script>

Chat {id}

<div class="border border-gray-200">
  <div class="sticky bottom-0 mx-auto w-[100ch] pb-4 pt-2">
    <Card>
      <CardContent class="p-2"></CardContent>
    </Card>
  </div>
</div>
