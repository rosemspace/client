import SFCBlock from './SFCBlock'

export default interface SFCDescriptor<Data = any> {
  id: string
  file: string
  blocks: Record<string, SFCBlock<Data>[]>
}
