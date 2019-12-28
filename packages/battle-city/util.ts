export type AttrLocationMap = Record<string, GLint>

export type UniformLocationMap = Record<string, WebGLUniformLocation>

export function assert<T>(
  shader: T | null,
  message: string
): asserts shader is T {
  if (shader === null) {
    throw new Error(message)
  }
}

export function getHTMLCanvasElement(
  canvas?: HTMLCanvasElement | string | null
): HTMLCanvasElement {
  if (canvas instanceof HTMLCanvasElement) {
    return canvas
  } else if (canvas) {
    const element: Element | null = globalThis.document.querySelector(canvas)

    if (element instanceof HTMLCanvasElement) {
      return element
    }
  }

  return globalThis.document.createElement('canvas')
}

export function getWebGLRenderingContext(
  canvas: HTMLCanvasElement
): WebGL2RenderingContext {
  const gl: WebGL2RenderingContext | null = canvas.getContext('webgl2')

  assert(gl, `"webgl2" context is not supported by your browser.`)

  return gl
}

export function loadShader(
  gl: WebGL2RenderingContext,
  source: string,
  type: GLenum,
  name = 'unknown'
): WebGLShader {
  const shader: WebGLShader | null = gl.createShader(type)

  assert(shader, `Error creating shader "${name}" of type ${type}.`)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      `Error compiling ${
        type === gl.VERTEX_SHADER ? `vertex` : `fragment`
      } shader "${name}": ${gl.getShaderInfoLog(shader)}`
    )
  }

  return shader
}

export function createProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  name = 'unknown'
): WebGLProgram {
  const program: WebGLProgram | null = gl.createProgram()

  assert(program, `Error creating program of shader "${name}"`)
  gl.attachShader(
    program,
    loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER, name)
  )
  gl.attachShader(
    program,
    loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER, name)
  )
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(
      `Error linking program of shader "${name}": ${gl.getProgramInfoLog(
        program
      )}`
    )
  }

  return program
}

export function initShaders(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
  name: string
): WebGLProgram {
  const program: WebGLProgram = createProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
    name
  )

  gl.useProgram(program)

  return program
}

export function getAttributeLocationMap(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
): AttrLocationMap {
  const attributeMap: AttrLocationMap = {}
  const attributeCount: number = gl.getProgramParameter(
    program,
    gl.ACTIVE_ATTRIBUTES
  )

  for (let i = 0; i < attributeCount; ++i) {
    const info: WebGLActiveInfo | null = gl.getActiveAttrib(program, i)

    if (!info) {
      break
    }

    const attribute: GLint | null = gl.getAttribLocation(program, info.name)

    assert(attribute, `Error retrieving attribute location.`)
    attributeMap[info.name] = attribute
  }

  return attributeMap
}

export function getUniformLocationMap(
  gl: WebGL2RenderingContext,
  program: WebGLProgram
): UniformLocationMap {
  const uniformMap: UniformLocationMap = {}
  const uniformCount: number = gl.getProgramParameter(
    program,
    gl.ACTIVE_UNIFORMS
  )

  for (let i = 0; i < uniformCount; ++i) {
    const info: WebGLActiveInfo | null = gl.getActiveUniform(program, i)

    if (!info) {
      break
    }

    const uniform: WebGLUniformLocation | null = gl.getUniformLocation(
      program,
      info.name
    )

    assert(uniform, `Error retrieving uniform location`)
    uniformMap[info.name] = uniform
  }

  return uniformMap
}
