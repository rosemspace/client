<template>
  <div id="app">
    <link
      href="https://fonts.googleapis.com/css?family=Montserrat:300,400,500,600,700"
      rel="stylesheet"
    />
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class App extends Vue {}
</script>

<style lang="postcss" scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-family: 'Montserrat', Helvetica, Arial, sans-serif;
  color: #294766;
}
#nav {
  padding: 30px;
  text-align: center;
}

#nav a {
  padding: 4px 10px;
  font-weight: bold;
  color: #2c3e50;
  border-left: solid 1px #2c3e50;

  &:hover {
    border-bottom: none;
  }

  &:first-of-type {
    border: none;
  }
}

#nav a.exactActive {
  color: #ffb0e7;
}
</style>
