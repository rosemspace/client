add `run` event (`run` -> `start` -> `cancel` -> `end`)
add `TransitionEvent` which extends `Event`

cancelled
beforeStageChange
beforeStart
start

1. `requestAnimationFrame`
    1. _measure_ `getComputedStyle` to calculate `height`
    2. _measure_ Get `scrollHeight`
    3. _mutate_  Set `height` to `0`
    4. _mutate_  Set `before-enter` CSS classes
2. `requestAnimationFrame`
    1. _measure_ `getComputedStyle` to calculate duration
    2. _mutate_  Set height to `scrollHeight`
    3. _mutate_  Remove `before-enter` CSS classes
    4. _mutate_  Set `enter` CSS classes

---

1. beforeStart - requestAnimationFrame1 - mutate (classList)
2. requestAnimationFrame1 - measure (getComputedStyle)

leave <-> afterLeave / enter
