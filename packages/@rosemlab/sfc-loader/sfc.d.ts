declare module '*.sfc' {
  import SFCDescriptor from '@rosemlab/sfc-loader/SFCDescriptor'

  const descriptor: SFCDescriptor

  export default descriptor
}
