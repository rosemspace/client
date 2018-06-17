<script>
import NavBar from '@rosem/vue-app/components/nav-bar'

export default {
  components: { NavBar },
}
</script>

<template>
  <div :class="$style.container">
    <NavBar/>
    <slot/>
  </div>
</template>

<style lang="scss" module>
@import '~\@rosem/design/index.scss';

.container {
  min-width: $size-content-width-min;
  max-width: $size-content-width-max;
  margin: 0 auto;
}
</style>
