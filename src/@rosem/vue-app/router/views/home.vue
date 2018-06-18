<script>
import appConfig from '@rosem/vue-app/app.config'
import Layout from '@rosem/vue-app/router/layouts/main'

export default {
  page: {
    title: 'Home',
    meta: [{ name: 'description', content: appConfig.description }],
  },
  components: { Layout },
}
</script>

<template>
  <Layout>
    <rosem-input
      label="Email"
      type="email"
    />
    <h1>Home Page</h1>
    <img
      src="~@rosem/vue-app/assets/images/logo.png"
      alt="Logo"
    >
  </Layout>
</template>
