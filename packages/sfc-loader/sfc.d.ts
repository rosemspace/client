declare module '*.sfc' {
  import SFCDescriptor from '@rosemlabs/sfc-loader/SFCDescriptor'

  const descriptor: SFCDescriptor

  export default descriptor
}
