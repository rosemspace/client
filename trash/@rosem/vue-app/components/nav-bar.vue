<template>
  <ul :class="$style.container">
    <NavBarRoutes :routes="persistentNavRoutes" />
    <NavBarRoutes v-if="loggedIn" :routes="loggedInNavRoutes" />
    <NavBarRoutes v-else :routes="loggedOutNavRoutes" />
  </ul>
</template>

<script>
import { authComputed } from '../state/helpers'
import NavBarRoutes from './nav-bar-routes.vue'

export default {
  components: { NavBarRoutes },
  data() {
    return {
      persistentNavRoutes: [
        {
          name: 'home',
          title: 'Home',
        },
      ],
      loggedInNavRoutes: [
        {
          name: 'profile',
          title: () => 'Logged in as ' + this.currentUser.name,
        },
        {
          name: 'logout',
          title: 'Log out',
        },
      ],
      loggedOutNavRoutes: [
        {
          name: 'login',
          title: 'Log in',
        },
      ],
    }
  },
  computed: {
    ...authComputed,
  },
}
</script>

<style lang="postcss" module>
@import '~\@rosem/design';

.container {
  /* padding: 0; */

  /* margin: 0 0 $size-grid-padding; */
  padding: 0.6rem 0;
  margin: 0.6rem 0;
  text-align: center;
  list-style-type: none;

  & > li {
    display: inline-block;
    margin-right: var(--size-grid-padding);
  }
}
</style>
