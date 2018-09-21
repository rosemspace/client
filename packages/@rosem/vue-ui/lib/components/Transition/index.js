import EnterLeaveTransition from './EnterLeaveTransition'

window.addEventListener('load', function () {
  let el = document.querySelector('.view-home > div:first-child')
  window.trans = new EnterLeaveTransition(el, 'fade');
})

export AutoTransition from './AutoTransition'
