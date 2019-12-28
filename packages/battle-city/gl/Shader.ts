import {
  AttrLocationMap,
  getAttributeLocationMap,
  getUniformLocationMap,
  initShaders,
  UniformLocationMap,
} from '../util'

export default class Shader {
  public readonly name: string

  private readonly program: WebGLProgram

  private readonly attributes: AttrLocationMap = {}

  private readonly uniforms: UniformLocationMap = {}

  constructor(
    gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string,
    name: string
  ) {
    this.name = name
    this.program = initShaders(gl, vertexSource, fragmentSource, name)
    this.attributes = getAttributeLocationMap(gl, this.program)
    this.uniforms = getUniformLocationMap(gl, this.program)
  }

  /**
   * Gets the location of an attribute with the provided name.
   * @param name The name of the attribute whose location to retrieve
   */
  getAttributeLocation(name: string): GLint {
    if (this.attributes[name] === void 0) {
      throw new Error(
        `Unable to find attribute named "${name}" in shader named "${this.name}".`
      )
    }

    return this.attributes[name]
  }

  /**
   * Gets the location of an uniform with the provided name.
   * @param name The name of the uniform whose location to retrieve
   */
  getUniformLocation(name: string): WebGLUniformLocation {
    if (this.uniforms[name] === void 0) {
      throw new Error(
        `Unable to find uniform named "${name}" in shader named "${this.name}".`
      )
    }

    return this.uniforms[name]
  }
}
