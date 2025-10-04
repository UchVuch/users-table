<template>
  <div class="page-wrapper">
    <UsersTable />
  </div>
</template>

<script setup lang="ts">
import UsersTable from '@/components/users/table/UsersTable.vue';
</script>

<style scoped>
.page-wrapper {
  padding: 20px 12px;
}
</style>
