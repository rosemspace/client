import SFCBlock from './SFCBlock'

export default interface SFCDescriptor {
  id: string
  file: string
  blocks: Record<string, SFCBlock[]>
}
