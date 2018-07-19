<template>
  <div :class="$options.name">
    <slot/>
    <div x-arrow/>
  </div>
</template>

<script>
export default {
  name: "RosemPopper"
};
</script>

<style lang="postcss">
.RosemPopper {
  background: white;
}
</style>
