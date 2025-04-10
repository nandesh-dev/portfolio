import { Camera, Scene, WebGLRenderer } from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/Addons.js'

export class Renderer {
    public domElement = document.createElement('div')

    private webGLRenderer = new WebGLRenderer()
    private css3DRenderer = new CSS3DRenderer()
    constructor() {
        this.domElement.classList.add('renderer')
        this.domElement.append(this.webGLRenderer.domElement, this.css3DRenderer.domElement)
    }

    setSize(width: number, height: number) {
        this.webGLRenderer.setSize(width, height)
        this.css3DRenderer.setSize(width, height)
    }

    render(scene: Scene, camera: Camera) {
        this.webGLRenderer.render(scene, camera)
        this.css3DRenderer.render(scene, camera)
    }
}
