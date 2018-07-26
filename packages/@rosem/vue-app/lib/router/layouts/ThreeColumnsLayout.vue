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
    <header>
      <NavBar v-once/>
    </header>
    <aside>
      <router-view name="columnBefore"/>
    </aside>
    <section>
      <slot/>
    </section>
    <aside>
      <router-view name="columnAfter"/>
    </aside>
    <TheFooter v-once/>
  </div>
</template>

<style lang="postcss" module>
/*@import '~\@rosem/design';*/

.container {
  display: grid;
  grid-template: "header     header  header"      auto
                 "aside-left content aside-right" 1fr
                 "footer     footer  footer"      auto / 20% 1fr 20%;
  /*min-width: $size-content-width-min;*/
  /*max-width: $size-content-width-max;*/
  max-width: 100%;
  margin: 0 auto;

  & > header {
    grid-area: header;
  }

  & > section {
    grid-area: content;
  }

  & > aside:first-of-type {
    grid-area: aside-left;
  }

  & > aside:last-of-type {
    grid-area: aside-right;
  }

  & > footer {
    grid-area: footer;
  }
}
</style>
