import { noop, isDefined } from './utils'

export default class TransitionStageSwitcher {
  static CLASS_PREFIX_FROM = ''
  static CLASS_PREFIX_ACTIVE = ''
  static CLASS_PREFIX_TO = ''
  static CLASS_PREFIX_DONE = ''
  static CLASS_SUFFIX_FROM = ''
  static CLASS_SUFFIX_ACTIVE = '-active'
  static CLASS_SUFFIX_TO = '-to'
  static CLASS_SUFFIX_DONE = '-done'

  name
  currentStage = 0
  running = false
  stages

  constructor(name = 'transition-stage', stages = [{}], currentStage = 0) {
    this.name = name
    this.stages = stages
    this.currentStage = currentStage
  }

  get stageName() {
    return `${this.name}-${this.stages[this.currentStage].name ||
      this.currentStage}`
  }

  get css() {
    let css = this.stages[this.currentStage].css || this.stages.css

    return css !== null && typeof css !== 'undefined' ? css : true
  }

  get duration() {
    return isDefined(this.stages[this.currentStage].duration)
      ? this.stages[this.currentStage].duration
      : isDefined(this.stages.duration)
        ? this.stages.duration
        : 0
  }

  get isExplicitDuration() {
    return (
      isDefined(this.stages[this.currentStage].duration) ||
      isDefined(this.stages.duration)
    )
  }

  get fromClass() {
    return (
      this.stages[this.currentStage].fromClass ||
      this.stages.fromClass ||
      TransitionStageSwitcher.CLASS_PREFIX_FROM +
        this.stageName +
        TransitionStageSwitcher.CLASS_SUFFIX_FROM
    )
  }

  get activeClass() {
    return (
      this.stages[this.currentStage].activeClass ||
      this.stages.activeClass ||
      TransitionStageSwitcher.CLASS_PREFIX_ACTIVE +
        this.stageName +
        TransitionStageSwitcher.CLASS_SUFFIX_ACTIVE
    )
  }

  get toClass() {
    return (
      this.stages[this.currentStage].toClass ||
      this.stages.toClass ||
      TransitionStageSwitcher.CLASS_PREFIX_TO +
        this.stageName +
        TransitionStageSwitcher.CLASS_SUFFIX_TO
    )
  }

  get doneClass() {
    return (
      this.stages[this.currentStage].doneClass ||
      this.stages.doneClass ||
      TransitionStageSwitcher.CLASS_PREFIX_DONE +
        this.stageName +
        TransitionStageSwitcher.CLASS_SUFFIX_DONE
    )
  }

  get beforeStart() {
    return (
      this.stages[this.currentStage].beforeStart ||
      this.stages.beforeStart ||
      noop
    )
  }

  get start() {
    return (
      this.stages[this.currentStage].start ||
      this.stages.start ||
      (this.isExplicitDuration
        ? function(_, done) {
            done()
          }
        : noop)
    )
  }

  get afterDone() {
    return (
      this.stages[this.currentStage].afterDone || this.stages.afterDone || noop
    )
  }

  get cancel() {
    return (
      this.stages[this.currentStage].cancelled || this.stages.cancelled || noop
    )
  }
}
