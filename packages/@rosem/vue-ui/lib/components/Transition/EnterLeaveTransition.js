import TransitionStageDispatcher from './TransitionStageDispatcher'

export default class EnterLeaveTransition extends TransitionStageDispatcher {
  constructor(element, name, currentStage = 1) {
    super(
      element,
      name,
      [
        {
          name: 'leave',
          // duration: 1000,
        },
        {
          name: 'enter',
          // duration: 1000,
        },
      ],
      currentStage
    )
  }

  enter() {
    this.start(1)
  }

  leave() {
    this.start(0)
  }

  toggle() {
    this.currentStage ? this.leave() : this.enter()
  }
}
