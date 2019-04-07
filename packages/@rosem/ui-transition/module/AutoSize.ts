import { Detail } from '../Module'
import Init from './Init'

export type Size = 'width' | 'height'
export type SizeProperty = 'offsetWidth' | 'offsetHeight'

export const sizeMap: Record<Size, SizeProperty> = {
  width: 'offsetWidth',
  height: 'offsetHeight',
}

export default abstract class AutoSize extends Init
{
  protected readonly sizeList: Size[]
  protected readonly propertyList: SizeProperty[]

  constructor(
    sizeList: Size[] = ['height']
  ) {
    super()
    this.sizeList = sizeList
    this.propertyList = sizeList.map((size) => sizeMap[size])
  }

  protected removeStyles({ target }: Detail): void {
    this.sizeList.forEach((property) => {
      target.style.setProperty(property, '')
    })
  }

  getDetail(): Partial<Detail> {
    return {
      autoSize: true,
      autoSizePropertyList: this.propertyList,
    }
  }
}
