import config from './config'
import ReactiveObject from '@rosem/reactivity/ReactiveObject'

export default class {
  static config: object = config

  static test() {
    let data = {
      a: 'rosem',
      b: 'roshe',
      computed: function() {
        // console.log('value a or b changed')
        return this.a + this.b
      },
    }

    let ro = new ReactiveObject(data)
    console.log(ro.computed)
    ro.a = 'rosem + '
    console.log(ro.computed);

    window.ro = ro
    console.log(ro);
    return ro
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
