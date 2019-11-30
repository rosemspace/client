import TransitionGroup from './TransitionGroup'

export default class TransitionGroupComposition {
  element
  options
  tracks = []

  constructor(element, options, tracksOptions) {
    this.element = element

    if (Array.isArray(options)) {
      tracksOptions = options
      options = {}
    }

    this.options = options
    tracksOptions.forEach(track => {
      this.tracks.push(
        track instanceof TransitionGroup
          ? track
          : new TransitionGroup(element, Object.assign(options, track))
      )
    })
  }

  leave(index = 0) {
    return Promise.all(
      this.tracks.map(track => {
        return track.leave(index)
      })
    )
  }

  enter(index = 0) {
    return Promise.all(
      this.tracks.map(track => {
        return track.enter(index)
      })
    )
  }

  toggle(index = 0, stageIndex) {
    return Promise.all(
      this.tracks.map(track => {
        return track.toggle(index, stageIndex)
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
