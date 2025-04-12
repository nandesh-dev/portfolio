import { Color, Euler, PerspectiveCamera, Scene, Vector3 } from 'three'
import { Renderer } from './renderer'
import { JourneyPath, Path } from './path'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { Tile } from './objects/tile'

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
    const buildPath = (path: Path, baseCoordinates?: Vector3, baseRotation?: Euler) => {
      let cummulativePosition = baseCoordinates?.clone() || new Vector3(0, 0, 0)
      let cummulativeRotation = baseRotation?.clone() || new Euler(0, 0, 0)

      for (const pathBlock of path) {
        cummulativeRotation.y += pathBlock.angle

        const relativePosition = new Vector3(1, 0, 0)
        relativePosition.applyEuler(cummulativeRotation)
        relativePosition.setLength(6)
        cummulativePosition.add(relativePosition)

        const tile = new Tile()
        tile.position.copy(cummulativePosition)
        tile.setRotationFromEuler(cummulativeRotation)

        this.scene.add(tile)

        if (pathBlock.branchPath) {
          for (const branchPath of pathBlock.branchPath) {
            buildPath(branchPath, cummulativePosition, cummulativeRotation)
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
