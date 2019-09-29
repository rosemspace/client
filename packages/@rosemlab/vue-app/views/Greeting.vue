<template>
  <div class="greeting">
    <div class="bg">
      <img src="../assets/bg.jpg" alt="Background image" />
    </div>
    <img v-if="isHome" id="logo" src="../assets/logo.png" alt="Logo" />
    <img v-else id="ava" src="../assets/ava.jpg" alt="Photo" />
    <div class="hello">
      <h1 v-if="isHome" class="title">
        Welcome to
        <span class="brand"><span class="r">R</span>osem</span> laboratory
      </h1>
      <h1 v-else class="title"><span class="brand"><span class="r">R</span>oshe</span></h1>
      <ul class="social">
        <li><a href="https://www.patreon.com/roshe" target="_blank">patreon</a></li>
        <li><a href="https://medium.com/@roshestory" target="_blank">medium</a></li>
        <li><a href="https://www.instagram.com/roshephoto" target="_blank">instagram</a></li>
        <li><a href="https://www.facebook.com/rosheface" target="_blank">facebook</a></li>
        <li><a href="https://twitter.com/roshenews" target="_blank">twitter</a></li>
        <li><a href="https://github.com/roshecode" target="_blank">github</a></li>
      </ul>
      <p v-if="isHome">
        Forward-looking web packages based on modern standards<br>
        for complex and modular applications written mainly in PHP and TypeScript.<br>
        <small>Documentation of packages will be added soon.</small>
      </p>
      <p v-else>
        Hello! My name is <strong>Roman Shevchenko</strong>. I was born in Ukraine.<br>
        I love PHP, TypeScript, Vue, the Earth and almost all people living here.<br>
        But most of all I ❤ <a href="https://github.com/rosemdev" target="_blank">rosem</a>.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class Greeting extends Vue {
  get isHome(this: Vue) {
    return this.$route.path === '/'
  }
}
</script>

<style lang="postcss" scoped>
.hello {
  padding: 20px 40px;

  & a {
    font-weight: 600;
  }

  & p {
    margin: 30px;
  }
}

.social {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0;
  margin: 10px;
  font-size: 1.2rem;
  color: #e8f2ff;
  background: linear-gradient(to right, transparent 20%, #9b71a545, transparent 80%);

  & li {
    margin: 0 12px;

    &:first-child {
      list-style: none;
    }
  }

  & a {
    display: block;
    padding: 4px;
    border-bottom: solid 1px transparent;
  }
}

.greeting {
  position: relative;
  flex-grow: 1;
  min-height: calc(100vh - 82px);
  padding-bottom: 20px;
  font-size: 1.6rem;
  text-align: center;

  & a {
    &:hover {
      border-bottom: solid 1px;
    }
  }
}

#logo, #ava {
  width: 34vw;
  min-width: 126px;
  max-width: 242px;
  border: solid 0 #333;
  border-radius: 5%;
  box-shadow: 0 14px 20px #13131380;
  transition: all .1s;
}

#ava {
  border: solid 6px #eaf0f9;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(19, 19, 19, .4);
}

.title {
  font-size: 3.2rem;
}

.brand {
  font-size: 5rem;
  color: #fde;
  white-space: nowrap;
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
