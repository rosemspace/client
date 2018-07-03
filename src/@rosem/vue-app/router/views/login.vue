<script>
import Layout from '@rosem/vue-app/router/layouts/main'
import { authMethods } from '@rosem/vue-app/state/helpers'
import appConfig from '@rosem/vue-app/app.config'

export default {
  page: {
    title: 'Log in',
    meta: [{ name: 'description', content: `Log in to ${appConfig.title}` }],
  },
  components: { Layout },
  data() {
    return {
      username: '',
      password: '',
      authError: null,
      tryingToLogIn: false,
    }
  },
  methods: {
    ...authMethods,
    // Try to log the user in with the username
    // and password they provided.
    tryToLogIn() {
      this.tryingToLogIn = true
      // Reset the authError if it existed.
      this.authError = null
      return this.logIn({
        username: this.username,
        password: this.password,
      })
        .then(token => {
          this.tryingToLogIn = false

          // Redirect to the originally requested page, or to the home page
          this.$router.push(this.$route.query.redirectFrom || { name: 'home' })
        })
        .catch(error => {
          this.tryingToLogIn = false
          this.authError = error
        })
    },
  },
}
</script>

<template>
  <Layout>
    <form
      :class="$style.form"
      @submit.prevent="tryToLogIn"
    >
      <div id="test"></div>
      <RosemPortal to="test">
        <RosemInput
          v-model="username"
          label="Email"
          name="username"
        />
      </RosemPortal>
      <RosemInput
        v-model="password"
        label="Password"
        name="password"
        type="password"
      />
      <RosemButton
        :disabled="tryingToLogIn"
        type="submit"
      >
        <RosemIcon
          v-if="tryingToLogIn"
          name="sync"
          spin
        />
        <span>Log in</span>
      </RosemButton>
      <p v-if="authError">
        There was an error logging in to your account.
      </p>
    </form>
  </Layout>
</template>

<style lang="scss" module>
@import '~\@rosem/design/index.scss';

.form {
  display: flow-root;
  text-align: center;
  margin: 0 auto;
  max-width: 300px;
  padding: 2rem 0;
  /*padding: 2rem;*/
  background-color: #f2f9fb;
  /*box-shadow: 0 0 10px #e3ecef;*/
  box-shadow: 0 1px 5px #dce7ea;

  button {
    /*margin-top: 20px;*/
  }
}
</style>
