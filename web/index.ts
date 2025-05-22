import {
    BoxGeometry,
    Color,
    IcosahedronGeometry,
    LinearSRGBColorSpace,
    Mesh,
    PerspectiveCamera,
    Scene,
    Texture,
    Vector3,
    WebGLRenderer,
} from 'three'
import './index.css'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { ObjectMaterial } from './materials/object'
import { SkyMaterial } from './materials/sky'

type DOMElements = {
    canvas: HTMLCanvasElement
}

const DOMCSSColorNames = ['gray', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'green', 'background', 'text']

type DOMCSSColors = {
    [name in (typeof DOMCSSColorNames)[number]]: {
        light: Color
        dark: Color
    }
}

type DOMCSS = {
    colors: DOMCSSColors
}

type DOMEventListeners = {
    cssupdate: (css: DOMCSS) => void
}

class DOM {
    public elements: DOMElements
    public css: DOMCSS

    private eventListeners: {
        [name in keyof DOMEventListeners]: DOMEventListeners[name][]
    }

    constructor() {
        this.elements = this.getElements()
        this.css = this.getCSS()

        this.eventListeners = { cssupdate: [] }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.css.colors = this.getCSSColors()
            for (const listener of this.eventListeners.cssupdate) {
                listener(this.css)
            }
        })
    }

    private getElements(): DOMElements {
        const canvas = document.querySelector('canvas')
        if (!canvas) throw new Error('Canvas element not found')

        return { canvas }
    }

    private getCSS(): DOMCSS {
        const colors = this.getCSSColors()

        return { colors }
    }

    private getCSSColors(): DOMCSSColors {
        const computedStyle = getComputedStyle(document.body)

        const colors: DOMCSSColors = {}

        for (const colorName of DOMCSSColorNames) {
            const dark = computedStyle.getPropertyValue(`--theme-color-${colorName}__dark`)
            if (!dark) throw new Error(`Color ${colorName} dark not found`)

            const light = computedStyle.getPropertyValue(`--theme-color-${colorName}__light`)
            if (!light) throw new Error(`Color ${colorName} light not found`)

            colors[colorName] = {
                dark: new Color(dark).convertLinearToSRGB(),
                light: new Color(light).convertLinearToSRGB(),
            }
        }

        return colors
    }

    public addEventListener<K extends keyof DOMEventListeners>(name: K, listener: DOMEventListeners[K]) {
        this.eventListeners[name].push(listener)
    }
}

type VisualParameters = {
    canvas: HTMLCanvasElement
    size: {
        height: number
        width: number
    }
}

class Visual {
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

class Application {
    private dom: DOM
    private visual: Visual

    private material: ObjectMaterial

    constructor() {
        this.dom = new DOM()
        this.visual = new Visual({
            canvas: this.dom.elements.canvas,
            size: { width: window.innerWidth, height: window.innerHeight },
        })

        this.visual.scene.background = new Texture()

        this.visual.camera.position.set(6, 4, 8)
        this.visual.camera.lookAt(0, 0, 0)

        this.material = new ObjectMaterial({
            color: {
                object: {
                    light: this.dom.css.colors.orange.light.clone(),
                    dark: this.dom.css.colors.orange.dark.clone(),
                },
                fog: this.dom.css.colors.background.dark.clone(),
            },
            roughness: 0.2,
            camera: {
                position: this.visual.camera.position.clone(),
            },
            sun: {
                position: new Vector3(500, 500, 500),
                intensity: 1000000,
            },
        })

        const cube = new Mesh(new BoxGeometry(2, 10, 2), this.material)
        cube.position.y = -4.8

        const sky = new Mesh(
            new IcosahedronGeometry(100),
            new SkyMaterial({
                color: {
                    light: this.dom.css.colors.background.light.clone(),
                    dark: this.dom.css.colors.background.dark.clone(),
                },
            })
        )

        this.visual.scene.add(sky)

        this.visual.scene.add(cube)

        new OrbitControls(this.visual.camera, this.dom.elements.canvas)

        this.animate()
    }

    private animate() {
        requestAnimationFrame(() => this.animate())

        this.material.updateParameters({
            ...this.material.parameters,
            camera: { position: this.visual.camera.position.clone() },
        })

        this.visual.render()
    }
}

new Application()
