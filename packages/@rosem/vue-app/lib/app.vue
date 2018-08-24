<template>
  <div id="app">
    <component :is="layout">
      <keep-alive>
        <!--
        Even when routes use the same component, treat them
        as distinct and create the component again.
        -->
        <router-view :key="$route.fullPath"/>
      </keep-alive>
    </component>
  </div>
</template>

<script>
import appConfig from './app.config'
import OneColumnLayout from './router/layouts/OneColumnLayout'
import ThreeColumnsLayout from './router/layouts/ThreeColumnsLayout'

export default {
  components: {
    OneColumnLayout,
    ThreeColumnsLayout,
  },

  page: {
    // All subcomponent titles will be injected into this template.
    titleTemplate(title) {
      if (typeof title === 'function') {
        title = title(this.$store)
      }

      return title
        ? `${appConfig.meta.prefix}${title}${appConfig.meta.suffix}`
        : appConfig.meta.title
    },
  },

  data() {
    return {
      layout: '',
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.layout =
        this.$route.meta.layout || appConfig.defaultLayout || 'OneColumnLayout'
    })
  },
}
</script>

<!-- This should generally be the only global CSS in the app. -->
<style lang="postcss">
/*
Allow element/type selectors, because this is global CSS.
stylelint-disable selector-max-type, selector-class-pattern

Normalize default styles across browsers,
https://necolas.github.io/normalize.css/
@import '~normalize.css/normalize.css';
Style loading bar between pages.
https://github.com/rstacruz/nprogress
@import '~nprogress/nprogress.css';

Design variables and utilities from @rosem/design.
@import '~\@rosem/design';
*/
@import './style/transitions.pcss';

*,
*::before,
*::after {
  box-sizing: border-box;
}

:root {
  height: 100%;
  overflow: hidden;
  font-size: 10px;
}

:root, #app, #app > div:first-of-type {
  height: 100%;
}

body {
  height: 100%;
  overflow: hidden scroll;
  background: var(--color-body-bg);
}

#app {
  /* @extend %typography-small; */
}

/* ===
/* Base element styles
/* === */

a,
a:visited {
  color: var(--color-link-text);
}

h1 {
  /* @extend %typography-xxlarge; */
}

h2 {
  /* @extend %typography-xlarge; */
}

h3 {
  /* @extend %typography-large; */
}

h4 {
  /* @extend %typography-medium; */
}

h5,
h6 {
  /* @extend %typography-small; */
}

/* ===
/* Vendor
/* === */

#nprogress .bar {
  background: var(--color-link-text);
}
</style>
