import Module from '../Module'

export type Size = 'width' | 'height'

export type Side = 'top' | 'right' | 'bottom' | 'left'

export type SizeProperty = 'scrollWidth' | 'scrollHeight'

export const SIZE_INDEX_SCROLL_SIZE_MAP: Record<Size, SizeProperty> = {
  width: 'scrollWidth',
  height: 'scrollHeight',
}

export const SIZE_INDEX_PADDING_SIDE_MAP: Record<Size, Side[]> = {
  width: ['left', 'right'],
  height: ['top', 'bottom'],
}

export function getPropertiesBySizeIndex(
  property: string,
  size: Size
): string[] {
  return SIZE_INDEX_PADDING_SIDE_MAP[size].map((size: Side) => {
    return `${property}-${size}`
  })
}

export type AutoSizeDetail = {
  width?: number
  height?: number
  sizeList: Size[]
}

export default abstract class AutoSize implements Module<AutoSizeDetail> {
  protected readonly sizeList: Size[]

  constructor(sizeList: Size[] = ['height']) {
    this.sizeList = sizeList
  }

  protected removeSizeStyles(target: HTMLElement | SVGSVGElement): void {
    this.sizeList.forEach((property) => {
      target.style.setProperty(property, '')
    })
  }

  getDetail(): AutoSizeDetail {
    return {
      sizeList: this.sizeList,
    }
  }
}
