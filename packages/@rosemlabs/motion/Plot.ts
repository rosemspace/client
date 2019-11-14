export type PlotOptions = Partial<{
  width: number
  height: number
  rotate: boolean
  swap: boolean
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

export const defaultPlotOptions: Required<PlotOptions> = {
  width: 300,
  height: 300,
  rotate: false,
  swap: true,
  boundaryOffsetX: 250,
  boundaryOffsetY: 250,
  axisThickness: 1,
  xAxisColor: '#bfd9df',
  yAxisColor: '#bfd9df',
  gridThickness: 1,
  gridColor: '#b9cce0',
  curveThickness: 3,
  curveColor: '#99b2c9',
}

export default class Plot {
  private canvas: HTMLCanvasElement
  private context: CanvasRenderingContext2D
  private readonly options: Required<PlotOptions>
  private readonly width: number
  private readonly height: number
  private readonly drawAreaWidth: number
  private readonly drawAreaHeight: number
  private readonly gridCellWidth: number
  private readonly gridCellHeight: number

  constructor(options: PlotOptions = {}) {
    this.options = { ...defaultPlotOptions, ...options }
    this.canvas = document.createElement('canvas')
    this.canvas.setAttribute('width', String(options.width))
    this.canvas.setAttribute('height', String(options.height))
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.drawAreaWidth = this.width - 2 * this.options.boundaryOffsetX
    this.drawAreaHeight = this.height - 2 * this.options.boundaryOffsetY
    this.gridCellWidth = this.width / 20
    this.gridCellHeight = this.height / 20
    this.clear()
  }

  clear(): void {
    this.context.beginPath()
    this.flush()
    this.drawCenter()
    this.drawAxes(this.options.boundaryOffsetX, this.options.boundaryOffsetY)
  }

  flush(): void {
    this.context.clearRect(0, 0, this.width, this.height)
    this.context.lineWidth = this.options.gridThickness
    this.context.strokeStyle = this.options.gridColor
    this.context.strokeRect(
      this.options.boundaryOffsetX,
      this.options.boundaryOffsetY,
      this.drawAreaWidth,
      this.drawAreaHeight
    )
    this.context.lineWidth = this.options.curveThickness
    this.context.strokeStyle = this.options.curveColor
  }

  drawAxes(x: number, y: number): void {
    const {
      axisThickness,
      boundaryOffsetX,
      boundaryOffsetY,
      xAxisColor,
      yAxisColor,
    } = this.options

    this.context.fillStyle = xAxisColor
    this.context.fillRect(
      x,
      boundaryOffsetY - this.gridCellHeight / 2,
      axisThickness,
      this.drawAreaWidth + this.gridCellWidth
    )
    this.context.fillStyle = yAxisColor
    this.context.fillRect(
      boundaryOffsetX - this.gridCellWidth / 2,
      y,
      this.drawAreaHeight + this.gridCellHeight,
      axisThickness
    )
  }

  drawCenter(): void {
    this.context.fillStyle = this.options.gridColor
    this.context.fillRect(
      this.width / 2,
      this.width / 2 - this.gridCellWidth / 2,
      1,
      this.gridCellWidth
    )
    this.context.fillRect(
      this.height / 2 - this.gridCellHeight / 2,
      this.height / 2,
      this.gridCellHeight,
      1
    )
  }

  draw(x: number, y: number): void {
    let X = this.options.boundaryOffsetX + this.drawAreaWidth * x,
      Y = this.options.boundaryOffsetY + this.drawAreaHeight * y
    this.flush()
    this.drawCenter()
    this.drawAxes(X, Y)
    this.context.lineTo(X, Y)
    this.context.stroke()
    this.context.moveTo(X, Y)
  }
}
