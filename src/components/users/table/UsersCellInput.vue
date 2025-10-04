<template>
  <InputText :default-value type="text" :on-blur="(e) => console.log(e)" />
</template>
<script setup lang="ts">
defineProps<{ defaultValue?: string }>();
</script>
