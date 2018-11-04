import TransitionGroup from './TransitionGroup'

export default class TransitionGroupComposition {
  tracks = []

  constructor(element, options, tracksOptions) {
    if (Array.isArray(options)) {
      tracksOptions = options
      options = {}
    }

    tracksOptions.forEach(track => {
      this.tracks.push(
        track instanceof TransitionGroup
          ? track
          : new TransitionGroup(element, Object.assign(options, track))
      )
    })
  }

  leave(index = 0, delegateTarget = null) {
    return Promise.all(
      this.tracks.map(track => {
        return track.leave(index, delegateTarget)
      })
    )
  }

  enter(index = 0, delegateTarget = null) {
    return Promise.all(
      this.tracks.map(track => {
        return track.enter(index, delegateTarget)
      })
    )
  }

  toggle(index = 0, stageIndex, delegateTarget = null) {
    return Promise.all(
      this.tracks.map(track => {
        return track.toggle(index, stageIndex, delegateTarget)
      })
    )
  }

  playTrack(trackIndex = 0, startStageIndex = 0, endStageIndex = null) {
    return Promise.all(
      this.tracks.map(track => {
        return track.playTrack(trackIndex, startStageIndex, endStageIndex)
      })
    )
  }

  play(startStageIndex = 0, endStageIndex = null) {
    return Promise.all(
      this.tracks.map(track => {
        return track.play(startStageIndex, endStageIndex)
      })
    )
  }
}
