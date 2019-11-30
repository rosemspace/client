import {
  cancelAnimationFrame,
  MS_PER_FRAME,
  queueMicrotask,
  requestAnimationFrame,
} from '@rosemlabs/std'
import {
  easeInExpo,
  bounceOut,
  bounceOutIn,
  circleInOut,
  easeInOut2D,
  easeIn2D,
  easeOut2D,
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
  fps: number
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

const floor = Math.floor

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
  timingFunction: easeOutElastic,
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
  private fps: number = 0
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
      fps: this.fps,
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
      this.startTime = time - MS_PER_FRAME
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
    const timePassed = time - this.startTime

    this.fps = floor(1 / ((timePassed - this.timePassed) / this.duration))

    if (timePassed < this.duration) {
      this.timePassed = timePassed
      this.animationId = requestAnimationFrame((time: number) =>
        this.computeFrame(time)
      )
    } else {
      this.timePassed = this.duration
      queueMicrotask(() => {
        this.running = false
        this.emit('process', this.getData())
        this.emit('end', this.getData())
      })
    }

    this.progress = this.timePassed / this.duration
    this.oscillation = [
      this.options.timingFunction(this.progress, this.options.params),
    ]
    this.value =
      this.startValue + this.approximate(this.interval * this.oscillation[0])
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

      this.interval = this.toValue - this.startValue
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
