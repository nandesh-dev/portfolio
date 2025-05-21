import { BoxGeometry, Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, Vector3, WebGLRenderer } from 'three'
import { animate } from 'animejs'
import './index.css'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

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

type MaterialParameters = {
    color: {
        object: {
            light: Color
            dark: Color
        }
        fog: Color
    }
    roughness: number
    camera: {
        position: Vector3
    }
    sun: {
        position: Vector3
        intensity: number
    }
}

class Material extends ShaderMaterial {
    public parameters: MaterialParameters
    constructor(parameters: MaterialParameters) {
        super({
            vertexShader: /* glsl */ `
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  vNormal = normal;

	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
            `,
            fragmentShader: /* glsl */ `
uniform vec3 uObjectColorLight;
uniform vec3 uObjectColorDark;
uniform vec3 uFogColor;
uniform float uRoughness;
uniform vec3 uCameraPosition;
uniform vec3 uSunPosition;
uniform float uSunIntensity;

varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  float lightIntensity = uSunIntensity;
  float lightDistance = length(uSunPosition - vPosition);
  vec3 lightDirection = normalize(uSunPosition - vPosition);

  vec3 viewDirection = normalize(uCameraPosition - vPosition);
  float viewDistance = length(uCameraPosition - vPosition);
  
  vec3 halfVector = normalize(lightDirection + viewDirection);

  float specularFactor = pow(uRoughness + (1.0 - uRoughness) * dot(vNormal, halfVector), 2.0);
  float lightAngleFactor = dot(vNormal, lightDirection);
  float lightDistanceFactor = pow(max(lightDistance, 0.00000001), -2.0);

  float depth = max(-vPosition.y, 0.0);
  float cameraAltitude = max(uCameraPosition.y, 0.0);
  float fogFactor = pow(clamp(viewDistance * (depth / max(depth + cameraAltitude, 0.00000001)) * 0.2, 0.0, 1.0), 0.8);

  float lightness = specularFactor * lightAngleFactor * lightDistanceFactor * lightIntensity;

  vec3 color = mix(mix(uObjectColorDark, uObjectColorLight, lightness), uFogColor, fogFactor);

	gl_FragColor = vec4(color, 1.0);
}
            `,
            uniforms: {
                uObjectColorLight: { value: parameters.color.object.light },
                uObjectColorDark: { value: parameters.color.object.dark },
                uFogColor: { value: parameters.color.fog },
                uRoughness: { value: parameters.roughness },
                uCameraPosition: { value: parameters.camera.position },
                uSunPosition: { value: parameters.sun.position },
                uSunIntensity: { value: parameters.sun.intensity },
            },
        })

        this.parameters = parameters
    }

    public updateParameters(parameters: MaterialParameters) {
        this.parameters = parameters

        this.uniforms.uObjectColorLight.value = parameters.color.object.light
        this.uniforms.uObjectColorDark.value = parameters.color.object.dark
        this.uniforms.uFogColor.value = parameters.color.fog
        this.uniforms.uRoughness.value = parameters.roughness
        this.uniforms.uCameraPosition.value = parameters.camera.position
        this.uniforms.uSunPosition.value = parameters.sun.position
        this.uniforms.uSunIntensity.value = parameters.sun.intensity
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

    private material: Material

    constructor() {
        this.dom = new DOM()
        this.visual = new Visual({
            canvas: this.dom.elements.canvas,
            size: { width: window.innerWidth, height: window.innerHeight },
        })

        this.visual.scene.background = this.dom.css.colors.background.dark.clone().convertSRGBToLinear()
        this.dom.addEventListener('cssupdate', (css) => {
            animate(this.visual.scene.background as Color, {
                ...css.colors.background.dark.getRGB({ r: 0, g: 0, b: 0 }),
                duration: 250,
            })
        })

        this.visual.camera.position.set(6, 4, 8)
        this.visual.camera.lookAt(0, 0, 0)

        this.material = new Material({
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
