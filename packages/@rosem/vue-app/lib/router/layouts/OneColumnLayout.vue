<script>
import NavBar from '../../components/nav-bar'
import TheFooter from '../../components/TheFooter'

export default {
  components: {
    NavBar,
    TheFooter,
  },
}
</script>

<template>
  <div :class="$style.container">
    <NavBar v-once/>
    <slot/>
    <TheFooter v-once/>
  </div>
</template>

<style lang="postcss" module>
/* @import '~\@rosem/design'; */

.container {
  display: grid;
  grid-template:
    'header' auto
    'content' 1fr
    'footer' auto / 1fr;

  /* min-width: $size-content-width-min; */

  /* max-width: $size-content-width-max; */
  max-width: 100%;
  margin: 0 auto;

  & > header {
    grid-area: header;
  }

  & > section {
    grid-area: content;
  }

  & > footer {
    grid-area: footer;
  }
}
</style>
