/**
 * Rendering loop.
 */
import Buffer, { AttrInfo } from './gl/Buffer'
import Shader from './gl/Shader'
import fragmentSource from './glsl/fragmentShader.glsl'
import vertexSource from './glsl/vertexShader.glsl'
import { getHTMLCanvasElement, getWebGLRenderingContext } from './util'

export default class Continuum {
  public readonly canvas: HTMLCanvasElement

  protected readonly gl: WebGL2RenderingContext

  private frameId = 0

  private startTime = 0

  // todo remove
  private buffer: Buffer | null = null
  private shader: Shader
  private scale: [number, number] = [1, 1]

  constructor(canvas?: HTMLCanvasElement | string | null) {
    this.canvas = getHTMLCanvasElement(canvas)
    this.gl = getWebGLRenderingContext(this.canvas)
    this.shader = new Shader(this.gl, vertexSource, fragmentSource, 'basic')
    this.createBuffer()
  }

  bigBang(): WebGL2RenderingContext {
    globalThis.addEventListener('load', this.start.bind(this))
    globalThis.addEventListener('resize', this.resize.bind(this))
    this.resize()

    return this.gl
  }

  start() {
    this.startTime = globalThis.performance.now()
    this.gl.clearColor(0, 0, 0, 1)
    this.frameId = globalThis.requestAnimationFrame((time: number) => {
      this.loop(time)
    })
  }

  stop() {
    globalThis.cancelAnimationFrame(this.frameId)
  }

  resize(): void {
    this.gl.viewport(
      0,
      0,
      (this.canvas.width = globalThis.document.body.clientWidth),
      (this.canvas.height = globalThis.document.body.clientHeight)
    )
    this.scale[0] = 1
    this.scale[1] = this.aspectRatio // * 1
  }

  get aspectRatio(): number {
    return this.canvas.width / this.canvas.height
  }

  private loop(time: number): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)

    const uScalingFactor = this.shader.getUniformLocation('uScalingFactor')
    const uGlobalColor = this.shader.getUniformLocation('uGlobalColor')

    this.gl.uniform2fv(uScalingFactor, this.scale)
    this.gl.uniform4f(uGlobalColor, (time % 2000) / 2000, (time % 1000) / 1000, 0, 1)

    this.buffer?.bind()
    this.buffer?.draw()

    this.frameId = requestAnimationFrame((time: number) => {
      this.loop(time)
    })
  }

  createBuffer() {
    const aVertexPosition: AttrInfo = {
      location: this.shader.getAttributeLocation('aVertexPosition'),
      size: 2,
    }
    const vertices: number[] = [
      0,
      0,
      // 0,
      0,
      0.5,
      // 0,
      0.5,
      0.5,
      // 0,
      0.5,
      0,
      // 0,
    ]

    this.buffer = new Buffer(this.gl, 2)
    this.buffer.addAttributeLocation(aVertexPosition)
    this.buffer.pushBackData(vertices)
    this.buffer.upload()
  }
}
