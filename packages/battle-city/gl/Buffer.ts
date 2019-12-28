import { assert } from '../util'

/**
 * Represents the information needed for a Buffer attribute.
 */
export type AttrInfo = {
  location: number
  size?: number
  offset?: number
}

export default class Buffer {
  private readonly gl: WebGL2RenderingContext

  private readonly vertexNumComponents: number

  private readonly dataType: GLenum

  private readonly targetBufferType: GLenum

  private readonly mode: GLenum

  private readonly typeSize: 1 | 2 | 4

  private readonly stride: number

  private readonly buffer: WebGLBuffer | null

  private readonly attributes: AttrInfo[] = []

  private data: number[] = []

  /**
   * Creates a new buffer.
   * @param gl
   * @param vertexNumComponents
   * @param dataType
   * @param targetBufferType
   * @param mode
   */
  constructor(
    gl: WebGL2RenderingContext,
    vertexNumComponents: number,
    {
      dataType = gl.FLOAT,
      targetBufferType = gl.ARRAY_BUFFER,
      mode = gl.TRIANGLES,
    }: Partial<{
      dataType: GLenum
      targetBufferType: GLenum
      mode: GLenum
    }> = {
      dataType: gl.FLOAT,
      targetBufferType: gl.ARRAY_BUFFER,
      mode: gl.TRIANGLES,
    }
  ) {
    this.gl = gl
    this.vertexNumComponents = vertexNumComponents
    this.dataType = dataType
    this.targetBufferType = targetBufferType
    this.mode = mode

    // Determine byte size
    switch (this.dataType) {
      case this.gl.FLOAT:
      case this.gl.INT:
      case this.gl.UNSIGNED_INT:
        this.typeSize = 4

        break
      case this.gl.SHORT:
      case this.gl.UNSIGNED_SHORT:
        this.typeSize = 2

        break
      case this.gl.BYTE:
      case this.gl.UNSIGNED_BYTE:
        this.typeSize = 1

        break
      default:
        throw new Error(`Unrecognized data type: ${this.dataType.toString()}`)
    }

    this.stride = this.vertexNumComponents * this.typeSize
    this.buffer = this.gl.createBuffer()
    assert(this.buffer, `Error creating buffer.`)
  }

  destroy(): void {
    this.gl.deleteBuffer(this.buffer)
  }

  bind(normalized = false): void {
    this.gl.bindBuffer(this.targetBufferType, this.buffer)

    for (const attribute of this.attributes) {
      this.gl.enableVertexAttribArray(attribute.location)
      this.gl.vertexAttribPointer(
        attribute.location,
        attribute.size ?? this.vertexNumComponents,
        this.dataType,
        normalized,
        this.stride,
        (attribute.offset ?? 0) * this.typeSize
      )
    }
  }

  unbind(): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null)

    for (const attribute of this.attributes) {
      this.gl.disableVertexAttribArray(attribute.location)
    }
  }

  addAttributeLocation(info: AttrInfo): void {
    this.attributes.push(info)
  }

  /**
   * Adds data to this buffer.
   * @param data
   */
  pushBackData(data: number[]): void {
    this.data.push(...data)
  }

  /**
   * Upload this buffer's data to the GPU.
   */
  upload(): void {
    this.gl.bindBuffer(this.targetBufferType, this.buffer)

    let bufferData: ArrayBuffer | null = null

    switch (this.dataType) {
      case this.gl.FLOAT:
        bufferData = new Float32Array(this.data)

        break
      case this.gl.INT:
        bufferData = new Int32Array(this.data)

        break
      case this.gl.UNSIGNED_INT:
        bufferData = new Uint32Array(this.data)

        break
      case this.gl.SHORT:
        bufferData = new Int16Array(this.data)

        break
      case this.gl.UNSIGNED_SHORT:
        bufferData = new Uint16Array(this.data)

        break
      case this.gl.BYTE:
        bufferData = new Int8Array(this.data)

        break
      case this.gl.UNSIGNED_BYTE:
        bufferData = new Uint8Array(this.data)

        break
      default:
        throw new Error(`Unknown data type: ${this.dataType}`)
    }

    this.gl.bufferData(this.targetBufferType, bufferData, this.gl.STATIC_DRAW)
    this.unbind()
  }

  draw(): void {
    if (this.targetBufferType === this.gl.ARRAY_BUFFER) {
      this.gl.drawArrays(
        this.mode,
        0,
        this.data.length / this.vertexNumComponents
      )
    } else if (this.targetBufferType === this.gl.ELEMENT_ARRAY_BUFFER) {
      this.gl.drawElements(this.mode, this.data.length, this.dataType, 0)
    } else {
      throw new Error(`Invalid target buffer type: ${this.targetBufferType}`)
    }
  }
}
