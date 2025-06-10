import {
    LinearSRGBColorSpace,
    Object3D,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/Addons.js'

export type VisualParameters = {
    webGLCanvas: HTMLCanvasElement
    css3DContainer: HTMLElement
    size: {
        height: number
        width: number
    }
}

export type Renderer = {
    webGL: WebGLRenderer
    css3D: CSS3DRenderer
}

export class Visual {
    public scene: Scene
    public camera: PerspectiveCamera
    public renderer: Renderer

    constructor({ webGLCanvas, css3DContainer, size }: VisualParameters) {
        this.scene = new Scene()

        this.camera = new PerspectiveCamera(
            50,
            size.width / size.height,
            0.1,
            1000
        )
        this.camera.rotateY(-Math.PI / 2)

        this.renderer = {
            webGL: new WebGLRenderer({ canvas: webGLCanvas, antialias: true }),
            css3D: new CSS3DRenderer({ element: css3DContainer }),
        }
        this.renderer.webGL.outputColorSpace = LinearSRGBColorSpace
        this.renderer.webGL.setSize(size.width, size.height)
        this.renderer.css3D.setSize(size.width, size.height)
    }

    public setSize(width: number, height: number) {
        this.renderer.webGL.setSize(width, height)
        this.renderer.css3D.setSize(width, height)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
    }

    public render() {
        this.renderer.webGL.render(this.scene, this.camera)
        this.renderer.css3D.render(this.scene, this.camera)
    }

    public add(...objects: Object3D[]) {
        this.scene.add(...objects)
    }
}
