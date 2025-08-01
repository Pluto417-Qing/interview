<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>

<template>
    <tr>
        <td class="card-text" v-for="(key, index) in Object.keys(item)">{{ item[key] }}</td>
    </tr>
</template>

<style scoped>

</style>
