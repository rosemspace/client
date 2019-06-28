```javascript
import { createAsyncComponent } from '@rosemlab/ui'

const AsyncComp = createAsyncComponent({
  factory: () => import('./Foo.vue'),
  delay: 200,
  timeout: 3000,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent
})
```

You can configure default options globally:

```javascript
createAsyncComponent.delay = 200
createAsyncComponent.timeout = 3000
createAsyncComponent.errorComponent = ErrorComponent
createAsyncComponent.pendingComponent = PendingComponent
```
