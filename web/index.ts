import { BoxGeometry, IcosahedronGeometry, Mesh } from 'three'
import './index.css'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { DOM } from './dom'
import { Visual } from './visual'
import { MaterialManager } from './material_manager'
import { BridgeObject } from './objects/bridge'
import { PathObject } from './objects/path'

class Application {
    private dom: DOM
    private visual: Visual
    private materialManager: MaterialManager

    constructor() {
        this.dom = new DOM()
        this.visual = new Visual({
            canvas: this.dom.elements.canvas,
            size: { width: window.innerWidth, height: window.innerHeight },
        })
        this.materialManager = new MaterialManager({ dom: this.dom, visual: this.visual })

        this.visual.camera.position.set(6, 4, 8)
        this.visual.camera.lookAt(0, 0, 0)

        const cube = new Mesh(new BoxGeometry(2, 10, 2), this.materialManager.getRandomShadeObjectMaterial('green'))
        cube.position.y = -4.8

        const sky = new Mesh(new IcosahedronGeometry(100), this.materialManager.getSkyMaterial())

        const bridge = new BridgeObject({ materialManager: this.materialManager })
        this.visual.scene.add(bridge)
        this.visual.scene.add(sky)

        const path = new PathObject({ materialManager: this.materialManager })
        const path2 = new PathObject({ materialManager: this.materialManager })
        this.visual.scene.add(path)
        this.visual.scene.add(path2)
        path.position.z = 3.7
        path2.position.z = -3.7
        //this.visual.scene.add(cube)

        new OrbitControls(this.visual.camera, this.dom.elements.canvas)

        this.animate()
    }

    private animate() {
        requestAnimationFrame(() => this.animate())

        this.materialManager.updateVisualBasedMaterialUniforms()

        this.visual.render()
    }
}

new Application()
