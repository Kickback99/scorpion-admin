<script setup lang="ts">
import { ref } from "vue";
import { IconSelect } from "@/components/MyIcon";

defineOptions({
  name: "IconSelect"
});

const icon = ref("ep:add-location");
</script>

<template>
    <IconSelect v-model="icon" class="w-[200px]" />
</template>
