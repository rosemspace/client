<script>
export default {
  page: {
    title: 'Loading page...',
    meta: [{ name: 'description', content: 'Loading page...' }],
  },
}
</script>

<template>
  <transition appear>
    <BaseIcon :class="$style.loadingIcon" name="sync" spin />
  </transition>
</template>

<style lang="postcss" module>
@import '~\@rosem/design';

.loadingIcon {
  /* @extend %typography-xxlarge; */

  display: block;
  margin: 0 auto;

  /* stylelint-disable-next-line selector-class-pattern */
  &:global(.v-enter-active) {
    transition: opacity 1s;
  }
  /* stylelint-disable-next-line selector-class-pattern */
  &:global(.v-enter) {
    opacity: 0;
  }
}
</style>
