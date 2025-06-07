import {
    ArrowHelper,
    AxesHelper,
    CatmullRomCurve3,
    Color,
    IcosahedronGeometry,
    Mesh,
    MeshBasicMaterial,
    Vector3,
} from 'three'
import './index.css'
import { DOM } from './dom'
import { Visual } from './visual'
import { MaterialManager } from './material_manager'
import { PathObject, PathObjectRadius } from './objects/path'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

const CAMERA_ALTITUDE = 1.5

type Branch = {
    objects: PathObject[]
    curve: CatmullRomCurve3
}

class Application {
    private dom: DOM
    private visual: Visual
    private materialManager: MaterialManager
    private branches: Branch[]
    private curve: CatmullRomCurve3
    private position: number
    private velocity: number
    private cameraHelper: ArrowHelper

    constructor() {
        this.dom = new DOM()
        this.visual = new Visual({
            canvas: this.dom.elements.canvas,
            size: { width: window.innerWidth, height: window.innerHeight },
        })
        this.materialManager = new MaterialManager({
            dom: this.dom,
            visual: this.visual,
        })
        this.branches = []
        this.position = 0
        this.velocity = 0
        this.cameraHelper = new ArrowHelper(
            new Vector3(1, 0, 0),
            new Vector3(0, 0, 0),
            2,
            new Color('cyan'),
            0.5,
            0.3
        )
        this.visual.scene.add(this.cameraHelper)

        this.visual.scene.add(new AxesHelper())
        this.visual.camera.position.y = 10
        this.visual.camera.position.x = 30

        const controls = new OrbitControls(
            this.visual.camera,
            this.visual.renderer.domElement
        )
        console.log(controls)
        controls.update()

        const sky = new Mesh(
            new IcosahedronGeometry(100),
            this.materialManager.getSkyMaterial()
        )
        this.visual.scene.add(sky)

        const curvePoints: Vector3[] = []
        const position = new Vector3()
        for (let i = 0; i < 3; i++) {
            position.add(new Vector3(PathObjectRadius * 2))
            const object = new PathObject({
                materialManager: this.materialManager,
                type: 'straight',
            })
            object.position.copy(position.clone())
            this.visual.scene.add(object)
            curvePoints.push(position.clone().setY(CAMERA_ALTITUDE))
        }

        for (let angle = 0; angle > -Math.PI; angle += -Math.PI / 4) {
            const branchCurvePoints: Vector3[] = [
                position.clone().setY(CAMERA_ALTITUDE),
            ]
            position.addScaledVector(
                new Vector3(Math.cos(angle), 0, Math.sin(angle)),
                PathObjectRadius * 2
            )
            branchCurvePoints.push(position.clone().setY(CAMERA_ALTITUDE))

            const object = new PathObject({
                materialManager: this.materialManager,
                type: 'branch',
            })
            object.position.copy(position)
            object.rotateY(-angle)
            this.visual.scene.add(object)
            curvePoints.push(position.clone().setY(CAMERA_ALTITUDE))

            const branchPosition = position.clone()
            const branchStartingAngle = angle + Math.PI / 4
            const branchObjects = []
            for (
                let angle = branchStartingAngle;
                angle < Math.PI;
                angle += Math.PI / 4
            ) {
                branchPosition.addScaledVector(
                    new Vector3(Math.cos(angle), 0, Math.sin(angle)),
                    PathObjectRadius * 2
                )
                const object = new PathObject({
                    materialManager: this.materialManager,
                    type: 'right',
                })
                object.position.copy(branchPosition)
                object.rotateY(-angle)
                this.visual.scene.add(object)
                branchObjects.push(object)
                branchCurvePoints.push(
                    branchPosition.clone().setY(CAMERA_ALTITUDE)
                )
            }

            const branchCurve = new CatmullRomCurve3(
                branchCurvePoints,
                false,
                'centripetal',
                0.4
            )

            branchCurve.getPoints(100).forEach((position) => {
                const cube = new Mesh(
                    new IcosahedronGeometry(),
                    new MeshBasicMaterial()
                )
                cube.scale.setScalar(0.06)
                cube.position.copy(position)
                this.visual.scene.add(cube)
            })

            this.branches.push({
                objects: branchObjects,
                curve: branchCurve,
            })
        }

        this.curve = new CatmullRomCurve3(
            curvePoints,
            false,
            'centripetal',
            0.4
        )
        this.animate()

        this.curve.getPoints(100).forEach((position) => {
            const cube = new Mesh(
                new IcosahedronGeometry(),
                new MeshBasicMaterial()
            )
            cube.scale.setScalar(0.06)
            cube.position.copy(position)
            this.visual.scene.add(cube)
        })

        window.addEventListener('wheel', (e) => {
            const MULTIPLIER = 0.00001

            this.velocity += e.deltaY * MULTIPLIER
        })
    }

    private animate() {
        requestAnimationFrame(() => this.animate())
        /*
        this.position += this.velocity
        this.velocity -= this.velocity * 0.04
        this.position = Math.max(0, this.position)
        */

        this.curve.getPoint(this.position, this.cameraHelper.position)
        const tangent = this.curve.getTangent(this.position)
        this.cameraHelper.setDirection(tangent)
        /*.set(
            Math.asin(tangent.y),
            Math.atan2(-tangent.x, -tangent.z),
            0
        )*/

        this.position += 0.002
        this.position = this.position % 1

        this.materialManager.updateVisualBasedMaterialUniforms()

        this.visual.render()
    }
}

new Application()
