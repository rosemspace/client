import SFCBlock from './SFCBlock'

export default interface SFCDescriptor {
  template: SFCBlock,
  scripts: SFCBlock[],
  styles: SFCBlock[],
  customBlocks: SFCBlock[],
}
