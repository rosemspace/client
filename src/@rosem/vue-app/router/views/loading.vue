<script>
import Layout from '@rosem/vue-app/router/layouts/main'

export default {
  page: {
    title: 'Loading page...',
    meta: [{ name: 'description', content: 'Loading page...' }],
  },
  components: { Layout },
}
</script>

<template>
  <Layout>
    <transition appear>
      <BaseIcon
        :class="$style.loadingIcon"
        name="sync"
        spin
      />
    </transition>
  </Layout>
</template>

<style lang="scss" module>
@import '~\@rosem/design/index.scss';

.loadingIcon {
  @extend %typography-xxlarge;

  display: block;
  margin: 0 auto;

  // stylelint-disable-next-line selector-class-pattern
  &:global(.v-enter-active) {
    transition: opacity 1s;
  }
  // stylelint-disable-next-line selector-class-pattern
  &:global(.v-enter) {
    opacity: 0;
  }
}
</style>
