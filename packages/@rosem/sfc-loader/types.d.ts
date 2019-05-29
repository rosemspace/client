declare module '*.sfc' {
  import SFCDescriptor from '@rosem/sfc-loader/SFCDescriptor'

  const descriptor: SFCDescriptor

  export default descriptor
}
