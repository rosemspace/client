<script>
import appConfig from '../../app.config'
import Layout from '../../router/layouts/main'

export default {
  page: {
    title: 'Home',
    meta: [{ name: 'description', content: appConfig.meta.description }],
  },
  components: { Layout },
}
</script>

<template>
  <Layout>
    <RosemInput
      label="Email"
      type="email"
    />
    <h1>Home Page</h1>
    <img
      src="../../assets/images/logo.png"
      alt="Logo"
    >
  </Layout>
</template>
