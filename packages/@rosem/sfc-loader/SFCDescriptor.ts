import SFCSection from './SFCSection'

export default interface SFCDescriptor {
  [section: string]: SFCSection[],
}
