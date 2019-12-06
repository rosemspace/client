const isProduction: boolean = 'production' === globalThis.process?.env?.NODE_ENV

export default isProduction
