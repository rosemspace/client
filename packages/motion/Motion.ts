import { isNumber } from 'lodash'
import {
  easeInExpo,
  bounceIn,
  bounceOut,
  bounceInOut,
  bounceOutIn,
  circleInOut,
  easeInOut2D,
  easeIn2D,
  easeOut2D,
  easeInElastic,
  easeOutElastic,
  TimingFunction,
  TimingFunction2D,
} from './timingFunction'

export type MotionOptions = Partial<{
  // value: number | string | any[]
  // deep: boolean
  // disabled: boolean
  delay: number
  duration: number
  precision: number
  timingFunction: TimingFunction //TimingFunction2D
  // reverse: boolean
  params: unknown[]
}> &
  MotionEvents

export type MotionEvents = Partial<{
  process: MotionEventListener
  start: MotionEventListener
  end: MotionEventListener
  cancelled: MotionEventListener
}>

export type MotionEventListener = (motionEvent: MotionEvent) => void

export type MotionEvent = Partial<{
  fps: number
  lowestFps: number
  precision: number
  duration: number
  fromValue: number
  value: number
  toValue: number
  startValue: number
  valueInterval: number
  startTime: number
  timePassed: number
  progress: number
  oscillation: number[]
  running: boolean
  reversed: boolean
}>

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
  timingFunction: bounceInOut,
  // reverse: false,
  params: [],
}

export default class Motion {
  private readonly options: Required<Omit<MotionOptions, keyof MotionEvents>> &
    MotionEvents
  private readonly duration: number
  private readonly precision: number
  private readonly approximate: (value: number) => number
  private animationId = 0
  private fps = 0
  private lowestFps = 0
  private fromValue = 0
  private toValue = 0
  private startValue = 0
  private valueInterval = 0
  private value = 0
  private startTime = 0
  private timePassed = 0
  private progress = 0
  private oscillation: number[] = [0]
  private running = false
  private reversed = false

  constructor(options: MotionOptions) {
    this.options = {
      ...defaultMotionOptions,
      ...options,
    }
    this.duration = isNumber(this.options.duration) ? this.options.duration : 0
    this.precision = isNumber(this.options.precision)
      ? this.options.precision
      : Infinity

    if (Number.isFinite(this.precision)) {
      const precisionFactor: number = Math.pow(10, this.precision)

      this.approximate = (value: number): number =>
        Math.round(value * precisionFactor) / precisionFactor
    } else {
      this.approximate = (value: number): number => value
    }
  }

  getData(): MotionEvent {
    return {
      fps: this.fps,
      lowestFps: this.lowestFps,
      duration: this.duration,
      precision: this.precision,
      fromValue: this.fromValue,
      toValue: this.toValue,
      startValue: this.startValue,
      valueInterval: this.valueInterval,
      value: this.value,
      startTime: this.startTime,
      timePassed: this.timePassed,
      progress: this.progress,
      oscillation: this.oscillation,
      running: this.running,
      reversed: this.reversed,
    }
  }

  run() {
    this.pause()
    this.running = true
    this.lowestFps = 0
    this.animationId = requestAnimationFrame((time: number): void => {
      this.startTime = time
      this.timePassed = this.progress = 0
      this.oscillation = [0] //todo need?
      this.emit('start', this.getData())
      this.computeFrame(time)
    })
  }

  pause() {
    if (this.running) {
      cancelAnimationFrame(this.animationId)
      this.running = false
      this.emit('cancelled', this.getData())
    }
  }

  stop() {
    this.pause()
    this.value = this.startValue
  }

  computeFrame(time: number) {
    const timePassed = time - this.startTime

    this.fps = Math.floor(1_000 / ((timePassed || Infinity) - this.timePassed))

    if (this.fps < this.lowestFps || this.lowestFps <= 0) {
      this.lowestFps = this.fps
    }

    if (timePassed < this.duration) {
      this.timePassed = timePassed
      this.animationId = requestAnimationFrame((time: number) =>
        this.computeFrame(time)
      )
    } else {
      this.timePassed = this.duration
      this.running = false
      queueMicrotask(() => {
        this.emit('end', this.getData())
      })
    }

    this.progress = this.timePassed / this.duration
    this.oscillation = [
      this.options.timingFunction(this.progress, this.options.params),
    ]
    this.value =
      this.startValue +
      this.approximate(this.valueInterval * this.oscillation[0])
    this.emit('process', this.getData())
  }

  emit(eventName: keyof MotionEvents, motionInfo: MotionEvent): void {
    this.options[eventName]?.(motionInfo)
  }

  from(value: number): Motion {
    this.fromValue = this.startValue = value
    this.valueInterval = 0

    return this
  }

  to(value: number) {
    if (value !== this.startValue + this.valueInterval) {
      if (this.running) {
        // this.cancel()
        this.startValue = this.value
        this.toValue = this.reversed ? this.fromValue : value
      } else {
        if (this.reversed) {
          this.startValue = value
          this.toValue = this.fromValue
        } else {
          this.startValue = this.fromValue
          this.toValue = value
        }
      }

      this.valueInterval = this.toValue - this.startValue
      this.run()
    }
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
