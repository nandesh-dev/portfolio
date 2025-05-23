import { LinearSRGBColorSpace, PerspectiveCamera, Scene, WebGLRenderer } from 'three'

export type VisualParameters = {
    canvas: HTMLCanvasElement
    size: {
        height: number
        width: number
    }
}

export class Visual {
    public scene: Scene
    public camera: PerspectiveCamera
    public renderer: WebGLRenderer

    constructor({ canvas, size }: VisualParameters) {
        this.scene = new Scene()

        this.camera = new PerspectiveCamera(50, size.width / size.height, 0.1, 1000)

        this.renderer = new WebGLRenderer({ canvas, antialias: true })
        this.renderer.outputColorSpace = LinearSRGBColorSpace
        this.renderer.setSize(size.width, size.height)
    }

    public setSize(width: number, height: number) {
        this.renderer.setSize(width, height)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
    }

    public render() {
        this.renderer.render(this.scene, this.camera)
    }
}
