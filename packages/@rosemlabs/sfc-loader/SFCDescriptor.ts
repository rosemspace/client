import SFCBlock from './SFCBlock'

export default interface SFCDescriptor {
  id: string
  file: string
  blocks: { [block: string]: SFCBlock[] }
}
