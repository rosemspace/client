// Returns global object of a current environment.
export default (() => {
  // @ts-ignore
  if (null != global && global.Math === Math) {
    // @ts-ignore
    return global;
  }

  // @ts-ignore
  if (null != self && self.Math === Math) {
    return self;
  }

  // @ts-ignore
  if (null != window && window.Math === Math) {
    return window;
  }

  // eslint-disable-next-line no-new-func
  return Function('return this')();
})();
