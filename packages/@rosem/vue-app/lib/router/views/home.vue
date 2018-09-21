<template>
  <div class="view-home">
    <!--<rosem-auto-transition>-->
      <!--<div v-show="autoTransition">-->
      <div>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet aspernatur, culpa cum dolores eaque eum ex
          harum, iste iure laboriosam magni neque nihil, nulla numquam quia sapiente sequi suscipit vel!
        </p>
        <p>A ab architecto blanditiis consectetur culpa cum eligendi facilis fugiat labore maxime nam non porro quos
          rem sit tenetur, voluptas. Accusantium beatae dolorem eaque earum eius id laudantium quisquam temporibus?
        </p>
      </div>
    <!--</rosem-auto-transition>-->
    <button @click="autoTransition = !autoTransition">Toggle transition</button>
    <!--<div class="parallax">-->
      <!--<h1>Home Page</h1>-->
    <!--</div>-->
    <img
      src="../../assets/images/logo.png"
      alt="Logo"
    >
    <div class="motionPreview">
      <button @click="value = value === 200 ? 0 : 200">Toggle</button>
      <rosem-motion
        :value="value"
        :duration="1000"
        @start="$refs.motionCurve.clear()"
        :process="(t, osc1, osc2) => $refs.motionCurve.draw(1 - t, 1 - osc1)"
        :params="{restitution: .25}"
      >
        <div class="ball" slot-scope="{ value }" :style="`transform: translateY(${value}px)`"></div>
      </rosem-motion>
      <rosem-motion-curve ref="motionCurve"/>
    </div>
  </div>
</template>

<script>
import appConfig from '../../app.config'

export default {
  page: {
    title: 'Home',
    meta: [{ name: 'description', content: appConfig.meta.description }],
  },
  data() {
    return {
      autoTransition: false,
      value: 0,
    }
  },
}
</script>

<style lang="postcss">
.body {
  perspective: 1px;
  transform-style: preserve-3d;
}

.parallax {
  position: relative;
  transform-style: preserve-3d;
  min-height: 100vh;

  &::before {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    display: block;
    min-height: 100vh;
    content: "";
    background-image: url(../../assets/images/bg-clouds.jpg);
    background-size: cover;
    transform: translateZ(-1px) scale(2);
    transform-origin: center center 0;
  }
}

.motionPreview {
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
