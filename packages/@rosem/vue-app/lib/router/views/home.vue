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
    <div class="motion-preview">
      <button @click="value = value === 200 ? 0 : 200">Toggle</button>
      <rosem-motion
        :value="value"
        :duration="1000"
        @start="$refs.motionCurve.clear()"
        :process="(t, osc1, osc2) => $refs.motionCurve.draw(1 - t, osc1)"
        :params="{restitution: .25}"
      >
        <div class="ball" slot-scope="{ value }" :style="`transform: translateY(${value}px)`"></div>
      </rosem-motion>
      <rosem-motion-curve ref="motionCurve"/>
    </div>
  </Layout>
</template>

<script>
import appConfig from '../../app.config'
import Layout from '../../router/layouts/main'

export default {
  page: {
    title: 'Home',
    meta: [{ name: 'description', content: appConfig.meta.description }],
  },
  components: { Layout },
  data() {
    return {
      value: 0,
    }
  },
}
</script>

<style lang="pcss">
.motion-preview {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.ball {
  width: 50px;
  height: 50px;
  background: silver;
}
</style>
