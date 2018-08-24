// Globally register all base components for convenience, because they
// will be used very frequently. Components are registered using the
// PascalCased version of their file name.

import Vue from 'vue'
import uuid from './mixins/uuid'

Vue.use(uuid)

// https://webpack.js.org/guides/dependency-management/#require-context
const requireComponent = require.context(
  // Look for files in the current directory
  './components',
  // Do not look in subdirectories
  true,
  // Only include index.js files of first level subdirectories
  /^\.\/[\w-]+\/index\.js$/
)

// For each matching file name...
requireComponent.keys().forEach(fileName => {
  // Get the component
  const module = requireComponent(fileName);
  let components = {};
  components = Object.assign(components, module)

  if (components.default) {
    components[fileName.replace(/^\.\//, '').replace(/\/index\.js$/, '')] = components.default
    delete components.default
  }

  for (let [componentName, component] of Object.entries(components)) {
    if (component.install) {
      Vue.use(component)
    } else {
      // Globally register the component
      Vue.component('Rosem' + componentName, component)
    }
  }
})
