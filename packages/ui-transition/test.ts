const el = document.querySelector('.list') as HTMLElement
const name = 'morph'
const data = {
  index: 1,
  oldIndex: 1,
  frameId: 0,
  ready: false,
  running: false,
}
const getStage = (index: number) => (index ? 'enter' : 'leave')

el.classList.add(`${name}-${getStage(data.index)}-done`)

function transition() {
  cancelAnimationFrame(data.frameId)
  data.frameId = requestAnimationFrame(() => {
    console.log('FRAME 1')
    if (data.ready) {
      debugger
    }

    if (data.running) {
      debugger
      // skipped
      el.classList.remove(
        `${name}-${getStage(data.oldIndex)}-active`,
        `${name}-${getStage(data.oldIndex)}-to`
      )
      // data.running = false
    }

    // beforeSwitch
    el.classList.remove(`${name}-${getStage(data.oldIndex)}-done`)
    data.oldIndex = data.index
    // beforeStart
    el.classList.add(
      `${name}-${getStage(data.index)}-from`,
      `${name}-${getStage(data.index)}-active`
    )
    data.ready = true

    requestAnimationFrame(() => {
      console.log('FRAME 2')
      data.ready = false

      const computedStyle = getComputedStyle(el)
      if (computedStyle.transition === 'all 1.5s ease 0s') {
        console.log(computedStyle.transition)
      }

      // cancelled
      if (data.running) {
        debugger
        el.classList.remove(
          `${name}-${getStage(data.oldIndex)}-from`,
          `${name}-${getStage(data.oldIndex)}-active`,
          // `${name}-${getStage(data.oldIndex)}-to`
        )
      }

      // start
      data.running = true
      el.classList.remove(`${name}-${getStage(data.index)}-from`)
      el.classList.add(`${name}-${getStage(data.index)}-to`)

      el.addEventListener(
        'transitionend',
        function transitionend() {
          // debugger
          el.removeEventListener('transitionend', transitionend)

          // afterEnd
          data.running = false
          el.classList.remove(
            `${name}-${getStage(data.index)}-active`,
            `${name}-${getStage(data.index)}-to`
          )
          el.classList.add(`${name}-${getStage(data.index)}-done`)
        },
        false
      )
    })
  })
}

export default function toggle() {
  data.oldIndex = data.index
  data.index = Number(!data.index)
  console.log('TOGGLE', data.index)
  transition()
}
