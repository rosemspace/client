import Transition from './Transition'
import { resolveTarget } from './utils'

export default class TransitionGroup extends Transition {
  tracks = []

  get running() {
    return this.tracks.some(function(track) {
      return track.running
    })
  }

  set running(value) {
    return this.tracks.forEach(function(track) {
      track.running = value
    })
  }

  resolveTarget() {
    this.target = resolveTarget(this.options.currentTarget)
    this.delegateTargetResolver = this.options.target
  }

  track(index) {
    let track = this.tracks[index]

    if (!track) {
      track = this.tracks[index] = Object.assign(
        Object.create(Transition.prototype),
        this,
        {
          running: false,
          currentTarget: this.target,
        }
      )
    }

    track.target = this.target.children[index]
    track.delegateTarget = this.delegateTargetResolver
      ? resolveTarget(this.delegateTargetResolver, this.tracks[index].target)
      : track.target

    return track
  }

  forceLeave(index) {
    const targets =
      index != null ? [this.target.children[index]] : this.target.children

    if (this.options.css || this.options.hideAfterLeave) {
      Array.prototype.forEach.call(targets, target => {
        const resolvedTarget = resolveTarget(
          this.delegateTargetResolver,
          target
        )

        if (this.options.css) {
          resolvedTarget.classList.add(
            this.middlewareReferences.leaveCSSClassMiddleware.doneClass
          )
        }

        if (this.options.hideAfterLeave) {
          this.middlewareReferences.hideAfterLeaveMiddleware.hide(
            resolvedTarget
          )
        }
      })
    }
  }

  forceEnter(index) {
    const targets =
      index != null ? [this.target.children[index]] : this.target.children

    if (this.options.css) {
      Array.prototype.forEach.call(targets, target => {
        resolveTarget(this.delegateTarget, target).classList.add(
          this.middlewareReferences.enterCSSClassMiddleware.doneClass
        )
      })
    }
  }

  leave(index = 0, delegateTarget = null) {
    return this.track(index).leave(delegateTarget)
  }

  enter(index = 0, delegateTarget = null) {
    return this.track(index).enter(delegateTarget)
  }

  toggle(index = 0, stageIndex, delegateTarget = null) {
    const transition = this.track(index)

    if (!Number.isInteger(stageIndex)) {
      delegateTarget = stageIndex
      stageIndex = Number(!transition.stageIndex)
    }

    return stageIndex !== Transition.STAGE_LEAVE_ORDER
      ? transition.enter(delegateTarget)
      : transition.leave(delegateTarget)
  }

  playTrack(trackIndex = 0, stageIndex = 0) {
    return this.track(trackIndex).playFromStage(stageIndex)
  }

  play(stageIndex = 0) {
    if (this.tracks.length !== this.target.children.length) {
      this.tracks = Array.from(
        new Array(this.target.children.length),
        (_, index) => this.tracks[index] || this.track(index)
      )
    }

    return Promise.all(
      this.tracks.map(track => {
        return track.playFromStage(stageIndex)
      })
    )
  }
}
