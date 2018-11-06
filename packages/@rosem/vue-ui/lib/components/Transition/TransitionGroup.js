import Transition from './Transition'
import { isDefined, resolveTarget } from './utils'

export default class TransitionGroup {
  element
  targets
  options
  tracks = []
  defaultTransition

  constructor(element, options) {
    this.element = resolveTarget(element)
    this.options = Object.assign(
      {
        forceUpdate: true,
        stageIndexMap: {},
        duration: null,
        css: true,
        events: true,
        auto: [],
        hideAfterLeave: true,
      },
      options || {}
    )
    const range = this.options.range
    this.range = range
      ? Array.isArray(range)
        ? range.length > 1
          ? range
          : [range[0], this.element.children.length]
        : [range, this.element.children.length]
      : [0, this.element.children.length]
    this.targets = Array.prototype.slice.call(
      this.element.children,
      this.range[0],
      this.range[1]
    )

    if (this.options.forceUpdate) {
      this.createDefaultTransition()
      this.forceUpdate()
    }
  }

  get stageIndex() {
    if (this.tracks.length) {
      const enterStagesCount = this.tracks.reduce(function(
        accumulator,
        currentValue
      ) {
        return accumulator + currentValue.stageIndex
      },
      0)

      return !enterStagesCount
        ? 0
        : this.tracks.length === enterStagesCount
          ? 1
          : 'mixed'
    }

    return this.options.stageIndex || 0
  }

  get running() {
    return this.tracks.some(function(track) {
      return track.running
    })
  }

  createDefaultTransition() {
    return (this.defaultTransition = new Transition(
      this.element,
      Object.assign(this.options, { forceUpdate: false })
    ))
  }

  cloneDefaultTransition() {
    return Object.assign(
      Object.create(Transition.prototype),
      this.defaultTransition || this.createDefaultTransition(),
      { target: null }
    )
  }

  forceLeave(index) {
    return Promise.all(
      Array.prototype.map.call(
        isDefined(index) ? [this.targets[index]] : this.targets,
        (target, index) => {
          this.defaultTransition.target = target

          return this.options.stageIndexMap[index] !==
            Transition.STAGE_ENTER_ORDER
            ? this.defaultTransition.forceLeave()
            : this.getTrack(index).forceEnter()
        }
      )
    ).then(data => {
      this.defaultTransition.target = this.options.target

      return data
    })
  }

  forceEnter(index) {
    return Promise.all(
      Array.prototype.map.call(
        isDefined(index) ? [this.targets[index]] : this.targets,
        target => {
          this.defaultTransition.target = target

          return this.options.stageIndexMap[index] !==
            Transition.STAGE_LEAVE_ORDER
            ? this.defaultTransition.forceEnter()
            : this.getTrack(index).forceLeave()
        }
      )
    ).then(data => {
      this.defaultTransition.target = this.options.target

      return data
    })
  }

  forceUpdate(index) {
    return this.stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? this.forceEnter(index)
      : this.forceLeave(index)
  }

  getTrack(index) {
    let track = this.tracks[index]

    if (!track) {
      track = this.tracks[index] = this.cloneDefaultTransition()
    }

    if (track.target !== this.targets[index]) {
      track.target = this.targets[index]
    }

    return track
  }

  leave(index = 0) {
    return this.getTrack(index).leave()
  }

  enter(index = 0) {
    return this.getTrack(index).enter()
  }

  toggle(index = 0, stageIndex) {
    const transition = this.getTrack(index)

    if (!Number.isInteger(stageIndex)) {
      stageIndex = Number(!transition.stageIndex)
    }

    return stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? transition.enter()
      : transition.leave()
  }

  playTrack(trackIndex = 0, stageIndex = 0) {
    return this.getTrack(trackIndex).play(stageIndex)
  }

  play(startStageIndex = 0, endStageIndex = null) {
    if (this.tracks.length !== this.targets.length) {
      this.tracks = Array.from(
        new Array(this.targets.length),
        (_, index) => this.tracks[index] || this.getTrack(index)
      )
    }

    return Promise.all(
      this.tracks.map(track => {
        return track.play(startStageIndex, endStageIndex)
      })
    )
  }
}
