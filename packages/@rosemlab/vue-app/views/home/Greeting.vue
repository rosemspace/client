<template>
  <div class="greeting">
    <div class="bg">
      <img src="../../assets/bg.jpg" alt="Background image" />
    </div>
    <img id="logo" src="../../assets/logo.png" alt="Logo" />
    <div class="hello">
      <h1 class="title">
        Welcome to
        <span class="brand"><span class="r">R</span>osem</span> laboratory
      </h1>
      <p>
        For guide and recipes on how to configure / customize this project,<br />
        check out the
        <a href="https://github.com/vuejs/vue-cli/tree/dev/docs" target="_blank"
          >vue-cli documentation</a
        >.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Greeting extends Vue {}
</script>

<style lang="postcss" scoped>
.greeting {
  position: relative;
  text-align: center;
}

#logo {
  width: 34vw;
  min-width: 126px;
  max-width: 242px;
  border-radius: 5%;
  box-shadow: 0 14px 20px #13131380;
}

.hello {
  padding: 20px 40px;
}

.title {
  font-size: 3.2rem;
}

.brand {
  font-size: 5rem;
  color: #fde;
  text-transform: uppercase;
}

.r {
  position: relative;

  &::after {
    position: absolute;
    top: 50%;
    left: 0;
    display: block;
    width: 3.8rem;
    height: 3.8rem;
    content: '';
    border: solid 1px;
    transform: translateY(-50%) scale(1.2);
  }
}

.bg {
  position: absolute;

  /* nav height */
  top: -80px;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  display: block;
  overflow: hidden;

  & > img {
    width: 100%;
    height: 100%;
    filter: blur(30px);
    image-rendering: pixelated;
    object-fit: cover;
    transform: scale(1.4);
  }
}
</style>
