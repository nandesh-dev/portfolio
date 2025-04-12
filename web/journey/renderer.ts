import { Camera, Scene, WebGLRenderer, WebGLRendererParameters } from 'three'
import { CSS3DParameters, CSS3DRenderer } from 'three/examples/jsm/Addons.js'

export type RendererParameters = Partial<{
  webGL: WebGLRendererParameters
  css3D: CSS3DParameters
}>

export class Renderer {
  private children: [WebGLRenderer, CSS3DRenderer]

  constructor(parameters?: RendererParameters) {
    this.children = [
      new WebGLRenderer(parameters?.webGL),
      new CSS3DRenderer(parameters?.css3D),
    ]
  }

  public render(scene: Scene, camera: Camera) {
    for (const child of this.children) {
      child.render(scene, camera)
    }
  }

  public setSize(width: number, height: number) {
    for (const child of this.children) {
      child.setSize(width, height)
    }
  }
}
