import {
  easeInElastic,
  // easeOutElastic,
  // easeOutExpo,
  // easeOutBounce
} from './timingFunction'
// import { circleIn, circleOut, circleInOut } from "./timingFunction_old/circle";

// const msPerFrame = 1000 / 60,
const requestAnimationFrame =
  typeof window !== 'undefined'
    ? window.requestAnimationFrame.bind(window)
    : () => {}

export default {
  name: 'RosemMotion',

  render(h) {
    return this.$scopedSlots.default({
      running: this.running,
      value: this.motionValue,
      progress: this.progress,
      oscillation: this.oscillation,
    })
  },

  props: {
    value: {
      type: Number | String | Array,
      default: 0,
    },
    deep: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    delay: {
      type: Number,
      default: 300,
    },
    duration: {
      type: Number,
      default: 300,
    },
    precision: {
      type: Number,
      default: Infinity,
    },
    timingFunction: {
      type: Function,
      // default: timeFraction => timeFraction,
      // default: circleIn,
      // default: circleOut,
      // default: circleInOut,
      // default: easeOutBounce,
      default: easeInElastic,
      // default: easeOutElastic,
      // default: easeOutExpo,
    },
    reverse: {
      type: Boolean,
      default: false,
    },
    params: {
      type: Object,
    },
    process: {
      type: Function,
      default() {},
    },
  },

  watch: {
    value(newValue, oldValue) {
      if (this.value !== this.initialValue + this.intervalValue) {
        if (this.running) {
          this.initialValue = this.motionValue
          this.intervalValue =
            (this.reverse ? oldValue : newValue) - this.initialValue
        } else {
          if (this.reverse) {
            this.initialValue = newValue
            this.intervalValue = oldValue - this.initialValue
          } else {
            this.initialValue = oldValue
            this.intervalValue = newValue - this.initialValue
          }
        }

        this.run()
      }
    },
  },

  computed: {
    precisionFactor() {
      return Math.pow(10, this.precision)
    },
  },

  data() {
    return {
      motionValue: this.value,
      timePassed: 0,
      progress: 0,
      oscillation: 0,
      running: false,
    }
  },

  methods: {
    enable() {},

    $_createEvent() {
      return {
        timePassed: this.timePassed,
        delay: this.delay,
        duration: this.duration,
        initialValue: this.initialValue,
        value: this.value,
        progress: this.progress,
        oscillation: this.oscillation,
      }
    },

    approximate(value) {
      return Number.isFinite(this.precision)
        ? Math.round(value * this.precisionFactor) / this.precisionFactor
        : value
    },

    run() {
      this.cancel()
      this.running = true
      this.animationId = requestAnimationFrame(time => {
        this.startTime = time
        this.$emit('start', this.$_createEvent())
        this.$_computeFrame(time)
      })
    },

    cancel() {
      if (this.running) {
        cancelAnimationFrame(this.animationId)
        this.running = false
        this.$emit('cancelled', this.$_createEvent())
      }
    },

    pause() {
      if (this.running) {
        cancelAnimationFrame(this.animationId)
        this.running = false
        this.$emit('cancelled', this.$_createEvent())
      }
    },

    stop() {
      this.cancel()
      this.motionValue = this.initialValue
    },

    $_computeFrame(time) {
      this.timePassed = time - this.startTime

      if (this.timePassed < this.duration) {
        this.animationId = requestAnimationFrame(this.$_computeFrame)
      } else {
        this.timePassed = this.duration
        this.$nextTick(() => {
          this.running = false
          this.$emit('end', this.$_createEvent())
        })
      }

      const timeFraction = this.timePassed / this.duration
      const deformation = this.timingFunction(timeFraction, this.params)
      this.motionValue =
        this.initialValue + this.approximate(this.intervalValue * deformation)
      this.progress = timeFraction
      this.oscillation = this.process(timeFraction, deformation)
    },
  },

  created() {
    this.startTime = 0
    this.initialValue = this.value
    this.intervalValue = this.value
  },
}
