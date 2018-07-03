import {
  easeInElastic
  // easeOutElastic,
  // easeOutExpo,
  // easeOutBounce
} from "./timingFunction";
// import { circleIn, circleOut, circleInOut } from "./timingFunction/circle";

// const msPerFrame = 1000 / 60,
const requestAnimationFrame =
  typeof window !== "undefined"
    ? window.requestAnimationFrame.bind(window)
    : () => {};

export default {
  name: "RosemMotion",

  render(h) {
    return this.$scopedSlots.default({
      running: this.running,
      value: this.motionValue,
      progress: this.progress,
      progression: this.progression
    });
  },

  props: {
    value: {
      type: Number | String | Array,
      default: 0
    },
    deep: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    delay: {
      type: Number,
      default: 300
    },
    duration: {
      type: Number,
      default: 300
    },
    precision: {
      type: Number,
      default: Infinity
    },
    timingFunction: {
      type: Function,
      // default: timeFraction => timeFraction,
      // default: circleIn,
      // default: circleOut,
      // default: circleInOut,
      // default: easeOutBounce,
      default: easeInElastic
      // default: easeOutElastic,
      // default: easeOutExpo,
    },
    reverse: {
      type: Boolean,
      default: false
    },
    params: {
      type: Object
    },
    process: {
      type: Function,
      default() {}
    }
  },

  watch: {
    value(newValue, oldValue) {
      if (this.value !== this.startValue + this.intervalValue) {
        if (this.running) {
          this.startValue = this.motionValue;
          this.intervalValue =
            (this.reverse ? oldValue : newValue) - this.startValue;

          this.intervalProgression = this.intervalValue / this.value;
        } else {
          if (this.reverse) {
            this.startValue = newValue;
            this.intervalValue = oldValue - this.startValue;
          } else {
            this.startValue = oldValue;
            this.intervalValue = newValue - this.startValue;
          }

          this.intervalProgression = this.startValue / this.value;
        }

        // if (this.reverse) {
        //     if (this.running) {
        //         this.startValue = this.motionValue;
        //     } else {
        //         this.startValue = newValue;
        //     }
        //
        //     this.intervalValue = oldValue - this.startValue;
        // } else {
        //     if (this.running) {
        //         this.startValue = this.motionValue;
        //     } else {
        //         this.startValue = oldValue;
        //     }
        //
        //     this.intervalValue = newValue - this.startValue;
        // }

        this.run();
      }
    }
  },

  computed: {
    precisionFactor() {
      return Math.pow(10, this.precision);
    }
  },

  data() {
    return {
      motionValue: this.value,
      timePassed: 0,
      progress: 0,
      oscillation: 0,
      running: false
    };
  },

  methods: {
    enable() {},

    _getEvent() {
      return {
        timePassed: this.timePassed,
        delay: this.delay,
        duration: this.duration,
        from: this.startValue,
        to: this.value,
        oscillation: this.oscillation
      };
    },

    _approximate(value) {
      return Number.isFinite(this.precision)
        ? Math.round(value * this.precisionFactor) / this.precisionFactor
        : value;
    },

    run() {
      this.cancel();
      this.running = true;
      this.animationId = requestAnimationFrame(time => {
        this.startTime = time;
        this.$emit("start", this._getEvent());
        this.nextFrame(time);
      });
    },

    cancel() {
      if (this.running) {
        cancelAnimationFrame(this.animationId);
        this.running = false;
        this.$emit("cancelled", this._getEvent());
      }
    },

    stop() {
      this.cancel();
      this.motionValue = this.startValue;
    },

    nextFrame(time) {
      this.timePassed = time - this.startTime;

      if (this.timePassed < this.duration) {
        this.animationId = requestAnimationFrame(this.nextFrame);
      } else {
        this.timePassed = this.duration;
        this.$nextTick(() => {
          this.running = false;
          this.$emit("end", this._getEvent());
        });
      }

      const timeFraction = this.timePassed / this.duration,
        deformation = this.timingFunction(timeFraction, this.params);
      this.motionValue =
        this.startValue + this._approximate(this.intervalValue * deformation);
      this.progress = timeFraction;
      this.progression = this.intervalProgression * deformation;
      this.process(timeFraction, deformation);
    }
  },

  created() {
    this.startTime = 0;
    this.startValue = this.value;
    this.intervalValue = this.value;
    this.intervalProgression = 0;
  }
};
