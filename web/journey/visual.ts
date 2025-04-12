import { Color, PerspectiveCamera, Scene } from 'three'
import { Renderer } from './renderer'
import { ComputedPath, computePath } from './path'
import { CSS3DObject, OrbitControls } from 'three/examples/jsm/Addons.js'
import { Tile } from './objects/tile'

const JourneyPath = computePath([
  {
    angle: (0 * Math.PI) / 180,
    nodes: [(document.getElementById('template__heading') as HTMLTemplateElement).content.cloneNode(true)],
  },
  {
    angle: (45 * Math.PI) / 180,
  },
  {
    angle: (45 * Math.PI) / 180,
  },
  {
    angle: (0 * Math.PI) / 180,
  },
  {
    angle: (-45 * Math.PI) / 180,
  },
])

export class Visual {
  private renderer: Renderer
  private scene: Scene
  private camera: PerspectiveCamera

  constructor() {
    this.renderer = new Renderer({
      webGL: {
        canvas: document.getElementById('visual__webgl-renderer__canvas') as HTMLCanvasElement,
      },
      css3D: {
        element: document.getElementById('visual__css3d-renderer') as HTMLDivElement,
      },
    })

    this.scene = new Scene()
    this.scene.background = new Color().setHex(0xf4f5f5)

    this.camera = new PerspectiveCamera()
    this.camera.position.set(-4, 4, 0)
    new OrbitControls(this.camera, document.body)
    this.camera.lookAt(7, 0, 0)

    const visualDOMElement = document.getElementById('visual') as HTMLElement
    new ResizeObserver(([element]) => {
      this.updateSize(element.target.clientWidth, element.target.clientHeight)
    }).observe(visualDOMElement)

    this.build()
    this.animate()
  }

  private build() {
    const buildPath = (path: ComputedPath) => {
      for (const pathBlock of path) {
        const tile = new Tile()
        tile.position.copy(pathBlock.position)
        tile.setRotationFromEuler(pathBlock.rotation)

        this.scene.add(tile)

        for (const element of pathBlock.elements) {
          const css3DObject = new CSS3DObject(element)
          css3DObject.position.copy(pathBlock.position)
          const rotation = pathBlock.rotation.clone()
          rotation.y += -Math.PI / 2
          css3DObject.position.y += 1
          css3DObject.setRotationFromEuler(rotation)
          css3DObject.scale.setScalar(0.02)
          this.scene.add(css3DObject)
        }

        if (pathBlock.branches) {
          for (const branchPath of pathBlock.branches) {
            buildPath(branchPath)
          }
        }
      }
    }

    buildPath(JourneyPath)
  }

  private animate() {
    requestAnimationFrame(() => this.animate())

    this.renderer.render(this.scene, this.camera)
  }

  private updateSize(width: number, height: number) {
    this.renderer.setSize(width, height)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
  }
}
