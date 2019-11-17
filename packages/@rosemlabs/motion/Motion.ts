import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from '@rosemlabs/dom-easing'
import {
  bounceOut,
  bounceOutIn,
  circleInOut,
  easeOutElastic,
  TimingFunction,
  TimingFunction2D,
} from './timingFunction'

//Motion(20).to(15)
//Motion().from(20).to(15)

export type MotionOptions = Partial<{
  // value: number | string | any[]
  // deep: boolean
  // disabled: boolean
  delay: number
  duration: number
  precision: number
  timingFunction: TimingFunction // | TimingFunction2D
  // reverse: boolean
  params: any[]
}> &
  MotionEvents

export type MotionEvents = Partial<{
  process: MotionEventListener
  start: MotionEventListener
  end: MotionEventListener
  cancelled: MotionEventListener
}>

export type MotionEventListener = (data: MotionEventData) => void

export type MotionEventData = {
  precision: number
  duration: number
  fromValue: number
  value: number
  toValue: number
  startValue: number
  interval: number
  startTime: number
  timePassed: number
  progress: number
  oscillation: number[]
  running: boolean
  reversed: boolean
}

const defaultMotionOptions: Required<Omit<
  MotionOptions,
  keyof MotionEvents
>> = {
  // value: 0,
  // deep: false,
  // disabled: false,
  delay: 300,
  duration: 300,
  precision: Infinity,
  timingFunction: bounceOut,
  // reverse: false,
  params: [],
}

export default class Motion {
  private readonly options: Required<Omit<MotionOptions, keyof MotionEvents>> &
    MotionEvents
  private readonly duration: number
  private readonly precision: number
  private readonly approximate: (value: number) => number
  private animationId: number = 0
  private fromValue: number = 0
  private value: number = 0
  private toValue: number = 0
  private startValue: number = 0
  private interval: number = 0
  private startTime: number = 0
  private timePassed: number = 0
  private progress: number = 0
  private oscillation: number[] = [0]
  private running: boolean = false
  private reversed: boolean = false

  constructor(options: MotionOptions) {
    this.options = {
      ...defaultMotionOptions,
      ...options,
    }
    this.duration = this.options.duration || 0
    this.precision = this.options.precision ?? Infinity
    this.computeFrame = this.computeFrame.bind(this)

    if (Number.isFinite(this.precision)) {
      const precisionFactor: number = Math.pow(10, this.precision)

      this.approximate = (value: number): number =>
        Math.round(value * precisionFactor) / precisionFactor
    } else {
      this.approximate = (value: number): number => value
    }
  }

  getData(): MotionEventData {
    return {
      duration: this.duration,
      precision: this.precision,
      fromValue: this.fromValue,
      value: this.value,
      toValue: this.toValue,
      startValue: this.startValue,
      interval: this.interval,
      startTime: this.startTime,
      timePassed: this.timePassed,
      progress: this.progress,
      oscillation: this.oscillation,
      running: this.running,
      reversed: this.reversed,
    }
  }

  run() {
    this.cancel()
    this.running = true
    this.animationId = requestAnimationFrame((time: number): void => {
      this.startTime = time
      this.timePassed = this.progress = 0
      this.oscillation = [0] //todo need?
      this.emit('start', this.getData())
      this.computeFrame(time)
    })
  }

  cancel() {
    if (this.running) {
      cancelAnimationFrame(this.animationId)
      this.running = false
      this.emit('cancelled', this.getData())
    }
  }

  pause() {
    if (this.running) {
      cancelAnimationFrame(this.animationId)
      this.running = false
      this.emit('cancelled', this.getData())
    }
  }

  stop() {
    this.cancel()
    this.value = this.startValue
  }

  computeFrame(time: number) {
    this.timePassed = time - this.startTime

    if (this.timePassed < this.duration) {
      this.animationId = requestAnimationFrame(this.computeFrame)
    } else {
      this.timePassed = this.duration
      // this.$nextTick(() => {
      requestAnimationFrame(() => {
        this.running = false
        this.emit('process', this.getData())
        this.emit('end', this.getData())
      })
    }

    const timeFraction = this.timePassed / this.duration
    this.oscillation = [
      this.options.timingFunction(timeFraction, this.options.params),
    ]

    this.value =
      // 0 - dimension
      this.startValue + this.approximate(this.interval * this.oscillation[0])
    this.progress = timeFraction
    this.emit('process', this.getData())
  }

  emit(eventName: keyof MotionEvents, motionInfo: MotionEventData): void {
    this.options[eventName]?.(motionInfo)
  }

  from(value: number): Motion {
    this.fromValue = this.startValue = value
    this.interval = 0

    return this
  }

  to(value: number) {
    if (value !== this.startValue + this.interval) {
      if (this.running) {
        // this.cancel()
        this.startValue = this.value
        this.interval =
          (this.reversed ? this.fromValue : value) - this.startValue
      } else {
        if (this.reversed) {
          this.startValue = value
          this.interval = this.fromValue - this.startValue
        } else {
          this.startValue = this.fromValue
          this.interval = value - this.startValue
        }
      }

      this.toValue = value
      this.run()
    }

    // this.value = value
  }

  // render(h) {
  //   return this.$scopedSlots.default({
  //     running: this.running,
  //     value: this.value,
  //     progress: this.progress,
  //     oscillation: this.oscillation,
  //   })
  // }
}
