import Transition from './Transition'
import TransitionGroup from './TransitionGroup'
import TransitionGroupComposition from './TransitionGroupComposition'

window.addEventListener('load', function () {
  let el = document.querySelector('.view-home > aside')
  // let el = host.querySelector('.view-home > div:nth-child(2)')
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
  window.trans = new TransitionGroup(el, {
    name: 'expand-height',
    auto: 'height',
    range: 1,
    stageIndexMap: {
      0: 1
    }
  });
  // window.trans = new TransitionGroupComposition(el, {
  //   // css: false,
  //   // duration: 200
  // }, [
  //   {
  //     target: 'div:first-child',
  //     name: 'rotate-180',
  //     auto: 'height',
  //   },
  //   // concept
  //   // {
  //   //   target: 'div:first-child',
  //   //   name: 'expand-height',
  //   //   auto: 'height',
  //   //   merge: true,
  //   // },
  //   {
  //     target: 'div:last-child',
  //     name: 'expand-height',
  //     auto: 'height',
  //   },
  // ]);
  let btn = document.querySelector("#toggle")
  // btn.addEventListener("click", () => {
  //   trans.toggle().then(detail => {
  //     console.log('toggled', detail);
  //   });
  // })

  let btn2 = document.querySelector("#toggle2")
  let count = -1;
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
