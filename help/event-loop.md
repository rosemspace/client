1. In Node v11, nextTick callbacks and microtasks will run between each individual setTimeout and setImmediate callbacks, even if the timers queue or the immediates queue is not empty.
1. resolved/rejected promises and process.nextTick are both microtasks

- nextTick - schedule JavaScript before IO (before return to event loop)
- Promise.resolve - schedule Microtask
- requestAnimationFrame - schedule Task before Render
- setImmediate - schedule JavaScript after IO (1 time per iteration)
- setTimeout 0 - schedule Task

task == setTimeout(taskCallback, 0)
microtask == Promise callback == Promise.resolve().then(microtaskCallback)

NodeJS >= v11.0.0

|               |IO            |nextTick NodeJS|Promise.resolve|setImmediate NodeJS|setTimeout 0  |
|:--------------|:------------:|:-------------:|:-------------:|:-----------------:|:------------:|
|IO             |-             |?              |?              |?                  |before / after|
|nextTick NodeJS|              |-              |before         |before             |before / after|
|Promise.resolve|              |after          |-              |before             |before        |
|setImmediate   |              |after          |after          |-                  |before / after|
|setTimeout     |before / after|before / after |after          |before / after     |-             |
