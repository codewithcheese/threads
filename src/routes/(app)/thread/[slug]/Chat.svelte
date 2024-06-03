<script lang="ts">
  type Props = {
    id: string;
    open: boolean;
    onClose: () => void;
  };
  let { id, open, onClose } = $props();
</script>

Chat {id}
