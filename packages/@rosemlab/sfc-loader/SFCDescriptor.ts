import SFCBlock from './SFCBlock'

export default interface SFCDescriptor {
  [block: string]: SFCBlock[],
}
