<template>
  <div class="page-wrapper">
    <header class="header">
      <RouterLink to="login">login</RouterLink>
      <RouterLink to="register">register</RouterLink>
    </header>
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style scoped>
.page-wrapper {
  padding: 20px 12px;
}

.header {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}
</style>
