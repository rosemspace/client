<script>
export default {
  page: {
    title: 'Page timeout',
    meta: [
      { name: 'description', content: 'The page timed out while loading.' },
    ],
  },
}
</script>

<template>
  <h1 :class="$style.title">
    The page timed out while loading
  </h1>
</template>

<style lang="postcss" module>
.title {
  text-align: center;
}
</style>
