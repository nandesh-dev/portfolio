import {
    LinearSRGBColorSpace,
    Object3D,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
} from 'three'
import { CSS3DRenderer } from 'three/examples/jsm/Addons.js'

export class WebGLRendererElementNotFoundError extends Error {
    constructor() {
        super("WebGLRenderer element '#renderer__webgl' not found")
    }
}

export class CSS3DRendererElementNotFoundError extends Error {
    constructor() {
        super("CSS3DRenderer element '#renderer__css3d' not found")
    }
}

export type VisualParameters = {}

export type Renderer = {
    webGL: WebGLRenderer
    css3D: CSS3DRenderer
}

export class Visual {
    public scene: Scene
    public camera: PerspectiveCamera
    public renderer: Renderer

    constructor({}: VisualParameters) {
        const width = window.innerWidth
        const height = window.innerHeight
        const webGLRendererElement = document.getElementById(
            'renderer__webgl'
        ) as HTMLCanvasElement | null
        if (!webGLRendererElement) throw new WebGLRendererElementNotFoundError()
        const css3DRendererElement = document.getElementById(
            'renderer__css3d'
        ) as HTMLCanvasElement | null
        if (!css3DRendererElement) throw new CSS3DRendererElementNotFoundError()

        this.scene = new Scene()

        this.camera = new PerspectiveCamera(60, width / height, 0.1, 1000)
        this.camera.rotateY(-Math.PI / 2)

        this.renderer = {
            webGL: new WebGLRenderer({
                canvas: webGLRendererElement,
                antialias: true,
            }),
            css3D: new CSS3DRenderer({ element: css3DRendererElement }),
        }
        this.renderer.webGL.outputColorSpace = LinearSRGBColorSpace
        this.renderer.webGL.setSize(width, height)
        this.renderer.css3D.setSize(width, height)

        window.addEventListener('resize', () => {
            const width = window.innerWidth
            const height = window.innerHeight

            this.renderer.webGL.setSize(width, height)
            this.renderer.css3D.setSize(width, height)
            this.camera.aspect = width / height
            this.camera.updateProjectionMatrix()
        })
    }

    public render() {
        this.renderer.webGL.render(this.scene, this.camera)
        this.renderer.css3D.render(this.scene, this.camera)
    }

    public add(...objects: Object3D[]) {
        this.scene.add(...objects)
    }
}
