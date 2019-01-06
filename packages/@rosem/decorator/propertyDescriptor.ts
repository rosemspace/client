export const NON_CONFIGURABLE = {
  configurable: false,
  enumerable: true,
  writable: true,
}

export const NON_ENUMERABLE = {
  configurable: true,
  enumerable: false,
  writable: true,
}

export const NON_WRITABLE = {
  configurable: false,
  enumerable: false,
  writable: false,
}

export default function propertyDescriptor(descriptor: PropertyDescriptor) {
  return function(target: any, propertyKey: PropertyKey) {
    // first property defined in prototype, that's why we use getters/setters
    // (otherwise assignment in object will override property in prototype)
    Object.defineProperty(target, propertyKey, {
      get: function(): void {
        return
      },
      set: function(value: any): void {
        // here we have reference to instance and can set property directly to it
        Object.defineProperty(
          this,
          propertyKey,
          Object.assign({}, descriptor, { value })
        )
        delete target[propertyKey]
      },
      configurable: true,
      enumerable: descriptor.enumerable,
    })
  }
}

// export default function propertyDescriptor(descriptor: PropertyDescriptor) {
//   return function(target: any, propertyKey: PropertyKey) {
//     // first property defined in prototype, that's why we use getters/setters
//     // (otherwise assignment in object will override property in prototype)
//     const initDescriptor = Object.assign(
//       {
//         enumerable: true,
//       },
//       descriptor,
//       {
//         get: function(): void {
//           return
//         },
//         set: function(value: any): void {
//           // here we have reference to instance and can set property directly to it
//           Object.defineProperty(
//             this,
//             propertyKey,
//             Object.assign(
//               {
//                 configurable: true,
//                 enumerable: true,
//                 writable: true,
//               },
//               descriptor,
//               { value }
//             )
//           )
//           delete target[propertyKey]
//         },
//       }
//     )
//     delete initDescriptor.writable
//     initDescriptor.configurable = true
//     Object.defineProperty(target, propertyKey, initDescriptor)
//   }
// }
