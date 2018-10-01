<script>
export default {
  name: 'RosemTransition',
  inheritAttrs: false,
  render() {},
  methods: {
    beforeEnter(event) {
      console.log('beforeEnter', event);
    },
    enter(event) {
      console.log('enter', event);
    },
    afterEnter(event) {
      console.log('afterEnter', event);
    },
    beforeLeave(event) {
      console.log('beforeLeave', event);
    },
    leave(event) {
      console.log('leave', event);
    },
    afterLeave(event) {
      console.log('afterLeave', event);
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
