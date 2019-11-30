<script>
import { authMethods } from '../../state/helpers'
import appConfig from '../../app.config'

export default {
  page: {
    title: 'Log in',
    meta: [
      { name: 'description', content: `Log in to ${appConfig.meta.title}` },
    ],
  },
  data() {
    return {
      someText: 'Some text',
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
        .then((token) => {
          this.tryingToLogIn = false

          // Redirect to the originally requested page, or to the home page
          this.$router.push(this.$route.query.redirectFrom || { name: 'home' })
        })
        .catch((error) => {
          this.tryingToLogIn = false
          this.authError = error
        })
    },
  },
}
</script>

<template>
  <div>
    <form :class="$style.form" @submit.prevent="tryToLogIn">
      <RosemInput v-model="username" label="Email" name="username" />
      <RosemInput
        v-model="password"
        label="Password"
        name="password"
        type="password"
      />
      <RosemButton :disabled="tryingToLogIn" type="submit">
        <RosemIcon v-if="tryingToLogIn" name="sync" spin />
        <span>Log in</span>
      </RosemButton>
      <p v-if="authError">
        There was an error logging in to your account.
      </p>
    </form>
    <hr />
    <RosemPortalTarget name="test" />
    <hr />
    <RosemPortal to="test">
      <input v-model="someText" />
      <ul>
        <li>1</li>
        <li>2</li>
      </ul>
    </RosemPortal>
  </div>
</template>

<style lang="postcss" module>
@import '~\@rosem/design';

.form {
  display: flow-root;
  max-width: 300px;

  /* padding: 2rem; */
  padding: 2rem 0;
  margin: 0 auto;
  text-align: center;
  background-color: #f2f9fb;

  /* box-shadow: 0 0 10px #e3ecef; */
  box-shadow: 0 1px 5px #dce7ea;

  & button {
    /* margin-top: 20px; */
  }
}
</style>
