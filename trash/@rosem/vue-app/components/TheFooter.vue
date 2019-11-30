<template>
  <footer>
    <span>&copy; </span><time>{{ new Date().getFullYear() }}</time
    ><span> {{ appName }}</span>
    <p>All rights reserved</p>
  </footer>
</template>

<script>
import appConfig from '../app.config'

export default {
  created() {
    this.appName = appConfig.appName || 'Unknown'
  },
}
</script>
