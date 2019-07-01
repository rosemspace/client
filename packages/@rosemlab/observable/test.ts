import { computed, value, watch } from '.'
import ObservableObject, { ObservablePropertyKey } from './ObservableObject'

export default class {
  static test3() {
    // reactive state
    const count = value(0)
    // computed state
    const plusOne = computed(() => count.value + 1)
    // method
    const increment = () => { count.value++ }
    // watch
    watch(() => count.value * 2, (value) => {
      console.log(`count * 2 is ${value}`)
    })
    Object.assign(window, {
      count,
      plusOne,
      increment
    })
  }

  static test2() {
    let o1 = ObservableObject.create({
      value: 'rosem',
    })
    let o2 = ObservableObject.create({
      value: 'roshe',
    })
    let o3 = ObservableObject.create({})

    ObservableObject.defineComputedProperty(o3, 'value', {
      get(
        newVal: any,
        oldVal: any,
        prop: ObservablePropertyKey,
        obj: ObservableObject
      ): string {
        console.log(o1.value + '+' + o2.value)
        return o1.value + '+' + o2.value
      },
    })
    // ObservableObject.observeProperty(o1, 'value', function(
    //   newValue: string
    // ) {
    //   console.log(newValue, o3.value);
    // })
    // ObservableObject.observeProperty(o2, 'value', function(
    //   newValue: string
    // ) {
    //   console.log(newValue, o3.value);
    // })
    // @ts-ignore
    window.o1 = o1
    // @ts-ignore
    window.o2 = o2
    // @ts-ignore
    window.o3 = o3
  }

  static test() {
    let data = {
      firstName: '',
      lastName: '',
      a: 'rosem',
      b: 'roshe',
      _c: '=<3',
      get c() {
        return this._c
      },
      set c(value) {
        this._c = value
      },
    }
    let oo = ObservableObject.create(data)
    // window.ReactiveObject = ReactiveObject

    const inputFirstNameElement = document.createElement('input')
    const inputLastNameElement = document.createElement('input')
    const firstNameElement = document.createElement('p')
    const lastNameElement = document.createElement('p')
    const fullNameElement = document.createElement('p')
    inputFirstNameElement.addEventListener('input', function(event) {
      oo.firstName =
        (event.target && (<HTMLInputElement>event.target).value) || ''
    })
    inputLastNameElement.addEventListener('input', function(event) {
      oo.lastName =
        (event.target && (<HTMLInputElement>event.target).value) || ''
    })
    document.body.append(inputFirstNameElement)
    document.body.append(inputLastNameElement)
    document.body.append(firstNameElement)
    document.body.append(lastNameElement)
    document.body.append(fullNameElement)

    ObservableObject.observeProperty(oo, 'firstName', function(
      newValue: string
    ) {
      firstNameElement.textContent = newValue
    })
    ObservableObject.observeProperty(oo, 'lastName', function(
      newValue: string
    ) {
      lastNameElement.textContent = newValue
    })
    ObservableObject.defineComputedProperty(oo, 'fullName', {
      get(
        newVal: any,
        oldVal: any,
        prop: ObservablePropertyKey,
        obj: ObservableObject
      ): string {
        console.log('GET: ', newVal)
        return this.firstName + ' ' + this.lastName
      },
      set(
        value: any,
        oldValue: any,
        prop: ObservablePropertyKey,
        obj: ObservableObject
      ) {
        console.log('SET: ', value)
      },
    })
    ObservableObject.observeProperty(oo, 'fullName', function(
      newValue: string
    ) {
      fullNameElement.textContent = newValue
    })

    // ObservableObject.defineComputedProperty(oo, 'computed1', {
    //   value: function() {
    //     // console.log('value a or b changed')
    //     return this.a + this.b + this._c
    //   }
    // })
    // ObservableObject.defineComputedProperty(oo, 'computed2', {
    //   value: function() {
    //     return 'C2: ' + this.computed1
    //   }
    // })

    // @ts-ignore
    window.oo = oo
    console.log(oo)
    console.log(oo.computed1)
    return oo
  }
}

// var arrayProto = Array.prototype;
// var arrayMethods = Object.create(arrayProto);
//
// var methodsToPatch = [
//   'push',
//   'pop',
//   'shift',
//   'unshift',
//   'splice',
//   'sort',
//   'reverse'
// ];
//
// // getters / setters
// Object.defineProperty(data, names, {
//   enumerable: true,
//   configurable: true,
//   get: function(){
//     return value;
//   },
//   set: function(newValue){
//     if(value !== newValue){
//       value = newValue;
//       tellTheWorldIhaveChanged(); //somebody is watching!
//     }
//   }
// });
//
// // proxies
// data.names = new Proxy(data.names,{
//   set:function(obj, prop, value){
//     if(obj[prop] !== value){
//       obj[prop] = value;
//       tellTheWorldIhaveChanged();
//     }
//   }
// });
