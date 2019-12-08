export type PlotOptions = Partial<{
  width: number
  height: number
  rotate: boolean
  // swap: boolean
  reflectY: boolean
  boundaryOffsetX: number
  boundaryOffsetY: number
  axisThickness: number
  xAxisColor: string
  yAxisColor: string
  gridThickness: number
  gridColor: string
  curveThickness: number
  curveColor: string
}>

const PlotSymbol = Symbol('Plot')

export const defaultPlotOptions: Required<PlotOptions> = {
  width: 400,
  height: 400,
  rotate: false,
  // swap: false,
  reflectY: false,
  boundaryOffsetX: 100,
  boundaryOffsetY: 100,
  axisThickness: 1,
  xAxisColor: 'gray',
  yAxisColor: 'gray',
  gridThickness: 1,
  gridColor: 'lightgray',
  curveThickness: 2,
  curveColor: 'black',
}

export default class Plot {
  private readonly canvas: HTMLCanvasElement
  private readonly context2D: CanvasRenderingContext2D
  private options: Required<PlotOptions>
  private readonly width: number = 0
  private readonly height: number = 0
  private readonly drawAreaWidth: number = 0
  private readonly drawAreaHeight: number = 0
  private readonly gridCellWidth: number = 0
  private readonly gridCellHeight: number = 0

  constructor(canvas: HTMLCanvasElement | string, options: PlotOptions = {}) {
    this.canvas = resolveCanvas(canvas)
    this.context2D = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.options = { ...defaultPlotOptions, ...options }

    if (null != this.options.width) {
      this.width = this.options.width

      if (this.canvas.width !== this.width) {
        this.canvas.setAttribute('width', String(this.width))
      }
    } else {
      this.width = this.canvas.width
    }

    if (null != this.options.height) {
      this.height = this.options.height

      if (this.canvas.height !== this.height) {
        this.canvas.setAttribute('height', String(this.height))
      }
    } else {
      this.height = this.canvas.height
    }

    this.drawAreaWidth = this.width - 2 * this.options.boundaryOffsetX
    this.drawAreaHeight = this.height - 2 * this.options.boundaryOffsetY
    this.gridCellWidth = this.width * 0.05
    this.gridCellHeight = this.height * 0.05
    this.clear()
    this.drawField()
    this.drawCenter()
    this.drawAxes(this.options.boundaryOffsetX, this.options.boundaryOffsetY)
  }

  clear(): void {
    this.flush()
    this.context2D.beginPath()
  }

  flush(): void {
    // Clear previous axes
    this.context2D.clearRect(0, 0, this.width, this.height)
  }

  drawField(): void {
    const ctx: CanvasRenderingContext2D = this.context2D

    ctx.lineWidth = this.options.gridThickness
    ctx.strokeStyle = this.options.gridColor
    ctx.strokeRect(
      this.options.boundaryOffsetX + 0.5,
      this.options.boundaryOffsetY + 0.5,
      this.drawAreaWidth,
      this.drawAreaHeight
    )
  }

  drawCenter(): void {
    const ctx: CanvasRenderingContext2D = this.context2D

    ctx.fillStyle = this.options.gridColor
    ctx.fillRect(
      this.width / 2,
      this.height / 2 - this.gridCellHeight / 2,
      this.options.gridThickness,
      this.gridCellHeight
    )
    ctx.fillRect(
      this.width / 2 - this.gridCellWidth / 2,
      this.height / 2,
      this.gridCellWidth,
      this.options.gridThickness
    )
  }

  drawAxes(x: number, y: number): void {
    const ctx: CanvasRenderingContext2D = this.context2D
    const axisThickness = this.options.axisThickness

    ctx.lineWidth = axisThickness
    ctx.setLineDash([4])
    ctx.strokeStyle = this.options.xAxisColor
    ctx.strokeRect(
      x + 0.5,
      -axisThickness,
      this.width,
      this.height + 2 * axisThickness
    )
    ctx.strokeStyle = this.options.yAxisColor
    ctx.strokeRect(
      -axisThickness,
      y + 0.5,
      this.width + 2 * axisThickness,
      this.height
    )
    ctx.setLineDash([])
  }

  drawCurve(x: number, y: number): void {
    const ctx: CanvasRenderingContext2D = this.context2D

    ctx.lineWidth = this.options.curveThickness
    ctx.strokeStyle = this.options.curveColor
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.moveTo(x, y)
  }

  draw(x: number, y: number): void {
    let X = this.options.boundaryOffsetX + this.drawAreaWidth * x,
      Y = this.options.boundaryOffsetY + this.drawAreaHeight * y

    this.flush()
    this.drawField()
    this.drawCenter()
    this.drawAxes(X, Y)
    this.drawCurve(X, Y)
  }
}

const createResolveCanvasError: () => TypeError = () =>
  new TypeError('Canvas element or selector is required')

export function resolveCanvas(
  canvas: HTMLCanvasElement | string
): HTMLCanvasElement {
  if (!canvas) {
    throw createResolveCanvasError()
  }

  if (canvas instanceof HTMLCanvasElement) {
    return canvas
  } else {
    const canvasOrNull: HTMLCanvasElement | null = document.querySelector(
      canvas
    )

    if (!canvasOrNull || !(canvasOrNull instanceof HTMLCanvasElement)) {
      throw createResolveCanvasError()
    }

    return canvasOrNull
  }
}
