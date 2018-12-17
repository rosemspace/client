import config from './config'

export default class {
  static config: object = config
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

