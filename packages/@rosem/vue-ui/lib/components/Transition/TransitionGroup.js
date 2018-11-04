import Transition from './Transition'
import { resolveTarget } from './utils'

export default class TransitionGroup {
  element
  options
  tracks = []
  defaultTransition

  constructor(element, options) {
    this.element = resolveTarget(element)
    this.options = Object.assign(
      {
        forceUpdate: true,
        duration: null,
        css: true,
        events: true,
        auto: [],
        hideAfterLeave: true,
      },
      options
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
    return this.defaultTransition = new Transition(
      this.element,
      Object.assign(this.options, { forceUpdate: false })
    )
  }

  cloneDefaultTransition() {
    return Object.assign(
      Object.create(Transition.prototype),
      this.defaultTransition || this.createDefaultTransition()
    )
  }

  getDelegateTarget(target) {
    return this.options.target
      ? resolveTarget(this.options.target, target)
      : target
  }

  forceUpdate(index) {
    if (this.options.css || this.options.hideAfterLeave) {
      const targets =
        index != null ? [this.element.children[index]] : this.element.children

      if (this.stageIndex === Transition.STAGE_LEAVE_ORDER) {

        Array.prototype.forEach.call(targets, target => {
          const resolvedTarget = this.getDelegateTarget(target)

          if (this.options.css) {
            resolvedTarget.classList.add(
              this.defaultTransition.middleware.leaveCSSClasses
                .doneClass
            )
          }

          if (this.options.hideAfterLeave) {
            this.defaultTransition.middleware.hideAfterLeave.hide(
              resolvedTarget
            )
          }
        })
      } else if (this.stageIndex === Transition.STAGE_ENTER_ORDER) {
        Array.prototype.forEach.call(targets, target => {
          const resolvedTarget = this.getDelegateTarget(target)

          if (this.options.css) {
            resolvedTarget.classList.add(
              this.defaultTransition.middleware.enterCSSClasses
                .doneClass
            )
          }

          if (this.options.hideAfterLeave) {
            this.defaultTransition.middleware.showBeforeEnter.show(
              resolvedTarget
            )
          }
        })
      }
    }
  }

  getTrack(index) {
    let track = this.tracks[index]

    if (!track) {
      track = this.tracks[index] = this.cloneDefaultTransition()
    }

    if (track.target !== this.element.children[index]) {
      track.target = this.element.children[index]
      track.delegateTarget = this.getDelegateTarget(track.target)
      track.delegateTargetResolver = track.delegateTarget
    }

    return track
  }

  leave(index = 0, delegateTarget = null) {
    return this.getTrack(index).leave(delegateTarget)
  }

  enter(index = 0, delegateTarget = null) {
    return this.getTrack(index).enter(delegateTarget)
  }

  toggle(index = 0, stageIndex, delegateTarget = null) {
    const transition = this.getTrack(index)

    if (!Number.isInteger(stageIndex)) {
      delegateTarget = stageIndex
      stageIndex = Number(!transition.stageIndex)
    }

    return stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? transition.enter(delegateTarget)
      : transition.leave(delegateTarget)
  }

  playTrack(trackIndex = 0, stageIndex = 0) {
    return this.getTrack(trackIndex).play(stageIndex)
  }

  play(startStageIndex = 0, endStageIndex = null) {
    if (this.tracks.length !== this.element.children.length) {
      this.tracks = Array.from(
        new Array(this.element.children.length),
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
