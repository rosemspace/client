# @rosemlabs/observable

## API

```javascript
import { state, computed, watch } from '@rosemlabs/observer'

const data = state({ count: 1 })
const plusOne = computed(() => data.count + 1)

watch(plusOne, value => {
  console.log(`count + 1 is ${value}`)
})
```
