<template>
  <transition v-bind="Object.assign({name: 'expand', css: true}, $attrs)"
              @before-enter="beforeEnter"
              @enter="enter"
              @after-enter="afterEnter"
              @before-leave="beforeLeave"
              @leave="leave"
              @after-leave="afterLeave"
  >
    <slot/>
  </transition>
</template>
<script>
export default {
  name: 'AutoTransition',
  inheritAttrs: false,
  methods: {
    beforeEnter(el) {
      el.style.display = ''
      el.style.height = 'auto'
      this.height = el.getBoundingClientRect().height
      el.style.height = '0'
    },
    enter(el, done) {
      // debugger
      // setTimeout(() => {
        el.addEventListener('transitionend', this.done = done)
        el.style.height = this.height + 'px'
      // })
    },
    afterEnter(el) {
      el.style.height = 'auto'
      el.removeEventListener('transitionend', this.done)
    },
    beforeLeave(el) {
      el.style.height = el.getBoundingClientRect().height + 'px'
    },
    leave(el, done) {
      setTimeout(() => {
      //   el.addEventListener('transitionend', this.done = done)
      //   debugger
        el.style.height = ''
      },100)
    },
    afterLeave(el) {
      // el.removeEventListener('transitionend', this.done)
    },
  }
}
</script>

<style scoped>
* {
  will-change: height;
  overflow: hidden;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>

<style>
.expand-enter-active,
.expand-leave-active {
  overflow: hidden;
  transition: height 1s ease-in-out;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}
</style>
