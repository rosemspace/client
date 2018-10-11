import LeaveEnterTransition from './LeaveEnterTransition'
import LeaveEnterTransitionGroup from './LeaveEnterTransitionGroup'

window.addEventListener('load', function () {
  let el = document.querySelector('.view-home > aside')
  // let el = document.querySelector('.view-home > div:nth-child(2)')
  el.addEventListener("before-enter", event => console.log(event))
  el.addEventListener("enter", event => {
    // event.detail.done();
    console.log(event)
  })
  el.addEventListener("after-enter", event => console.log(event))
  el.addEventListener("enter-cancelled", event => console.log(event))
  el.addEventListener("before-leave", event => console.log(event))
  el.addEventListener("leave", event => console.log(event))
  el.addEventListener("after-leave", event => console.log(event))
  el.addEventListener("leave-cancelled", event => console.log(event))
  window.trans = new LeaveEnterTransitionGroup({
    target: el,
    delegateTarget: 'div'
  }, 'height', {
    auto: ['height', 'width'],
    // css: false,
    // duration: 200
  });
  let btn = document.querySelector("#toggle")
  // btn.addEventListener("click", () => {
  //   trans.toggle().then(detail => {
  //     console.log('toggled', detail);
  //   });
  // })

  let btn2 = document.querySelector("#toggle2")
  let count = 0;
  btn.addEventListener("click", () => {
    trans.toggle(++count % 3).then(detail => {
      console.log('toggled', detail);
    });
  })
  btn2.addEventListener("click", () => {
    trans.toggle(++count % 3, 'div').then(detail => {
      console.log('toggled', detail);
    });
  })
})
