<script setup lang="ts">
import TableCell from '@/components/ui/table/TableCell.vue';
import TableRow from '@/components/ui/table/TableRow.vue';

const { colspan = 1 } = defineProps<{ colspan?: number }>();
</script>

<template>
  <TableRow>
    <TableCell :colspan>
      <div class="table-empty">
        <slot />
      </div>
    </TableCell>
  </TableRow>
</template>

<style scoped>
.table-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-inline: 20px;
}
</style>
