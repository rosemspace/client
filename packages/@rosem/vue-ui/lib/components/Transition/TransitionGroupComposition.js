import TransitionGroup from './TransitionGroup'

export default class TransitionGroupComposition {
  tracks = []

  constructor(options, tracks) {
    if (Array.isArray(options)) {
      tracks = options
      options = {}
    }

    tracks.forEach(track => {
      this.tracks.push(
        track instanceof TransitionGroup
          ? track
          : new TransitionGroup(Object.assign(options, track))
      )
    })
  }

  leave(index = 0, delegateTarget = null) {
    return Promise.all(this.tracks.map(track => {
      return track.leave(index, delegateTarget)
    }))
  }

  enter(index = 0, delegateTarget = null) {
    return Promise.all(this.tracks.map(track => {
      return track.enter(index, delegateTarget)
    }))
  }

  toggle(index = 0, stageIndex, delegateTarget = null) {
    return Promise.all(this.tracks.map(track => {
      return track.toggle(index, stageIndex, delegateTarget)
    }))
  }

  playTrack(trackIndex = 0, stageIndex = 0) {
    return Promise.all(this.tracks.map(track => {
      return track.playTrack(trackIndex, stageIndex)
    }))
  }

  play(stageIndex = 0) {
    return Promise.all(this.tracks.map(track => {
      return track.play(stageIndex)
    }))
  }
}
