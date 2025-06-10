import { ArrowHelper, Color, IcosahedronGeometry, Mesh, Vector3 } from 'three'
import './index.css'
import { DOM } from './dom'
import { Visual } from './visual'
import { MaterialManager } from './material_manager'
import { PathObject, PathObjectRadius } from './objects/path'
import { CSS3DObject, OrbitControls } from 'three/examples/jsm/Addons.js'
import { Curve } from './curve'
import { Portfolio } from './portfolio'
import { Timeline } from 'animejs'

const CAMERA_ALTITUDE = 1.5

type Branch = {
    startDistance: number
    curve: Curve
    timeline: Timeline
}

type State = {
    distance: number
    velocity: number
    location: 'main' | 'branch'
}

class Application {
    private dom: DOM
    private visual: Visual
    private materialManager: MaterialManager
    private branches: Branch[]
    private selectedBranch: Branch | null
    private mainCurve: Curve
    private mainCurveTimeline: Timeline
    private state: State
    private cameraHelper: ArrowHelper

    constructor() {
        this.dom = new DOM()
        this.visual = new Visual({
            webGLCanvas: this.dom.elements.renderer.webGL,
            css3DContainer: this.dom.elements.renderer.css3D,
            size: { width: window.innerWidth, height: window.innerHeight },
        })
        this.materialManager = new MaterialManager({
            dom: this.dom,
            visual: this.visual,
        })
        this.branches = []
        this.state = {
            distance: 0,
            velocity: 0,
            location: 'main',
        }

        const sky = new Mesh(
            new IcosahedronGeometry(100, 1),
            this.materialManager.getSkyMaterial()
        )
        this.visual.add(sky)

        this.cameraHelper = new ArrowHelper(
            new Vector3(1, 0, 0),
            new Vector3(0, 0, 0),
            2,
            new Color('cyan'),
            0.5,
            0.3
        )
        this.visual.add(this.cameraHelper)

        this.visual.camera.position.set(25, 5, -7)
        const control = new OrbitControls(this.visual.camera, document.body)
        control.target.set(20, 1.5, 0)
        control.update()

        const position = new Vector3()
        const mainCurvePoints: Vector3[] = []
        this.mainCurveTimeline = new Timeline()

        for (let i = 0; i < Portfolio.introduction.length; i++) {
            position.add(new Vector3(2 * PathObjectRadius))

            const object = new PathObject({
                materialManager: this.materialManager,
                type: 'straight',
            })
            object.position.copy(position)
            this.visual.add(object)

            this.mainCurveTimeline.sync(
                object.timeline,
                mainCurvePoints.length * 0.8 * 1000
            )
            mainCurvePoints.push(position.clone().setY(CAMERA_ALTITUDE))
        }

        for (let s = 0; s < Portfolio.skills.length; s++) {
            const angle = (s * -Math.PI) / 4
            const branchStartingPosition = position.clone()
            position.addScaledVector(
                new Vector3(Math.cos(angle), 0, Math.sin(angle)),
                PathObjectRadius * 2
            )

            const object = new PathObject({
                materialManager: this.materialManager,
                type: s == Portfolio.skills.length - 1 ? 'right' : 'branch',
            })
            object.position.copy(position)
            object.rotateY(-angle)
            this.visual.scene.add(object)

            const skillElement = (
                this.dom.elements.template.skill[
                    Portfolio.skills[s].id
                ].content.cloneNode(true) as any
            ).children[0] as HTMLDivElement
            const skillNameObject = new CSS3DObject(skillElement)
            skillNameObject.scale.setScalar(0.01)
            skillNameObject.position.copy(position).setY(0.5)
            skillNameObject.rotateY(-angle - Math.PI / 2)
            this.visual.add(skillNameObject)

            this.mainCurveTimeline.sync(
                object.timeline,
                mainCurvePoints.length * 0.8 * 1000
            )
            mainCurvePoints.push(position.clone().setY(CAMERA_ALTITUDE))

            const branchCurvePoints: Vector3[] = [...mainCurvePoints]
            const branchPosition = position.clone()
            const branchStartingAngle = angle + Math.PI / 4
            const branchTimeline = new Timeline({ autoplay: false })

            for (let b = 0; b < Portfolio.skills[s].articles.length; b++) {
                const angle = branchStartingAngle + (b * Math.PI) / 4
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

                branchCurvePoints.push(
                    branchPosition.clone().setY(CAMERA_ALTITUDE)
                )
                branchTimeline.sync(object.timeline, b * 0.8 * 1000)
            }

            const branchCurve = new Curve(
                branchCurvePoints,
                false,
                'centripetal',
                0.4
            )
            /*
            branchCurve.getPoints(100).forEach((position) => {
                const cube = new Mesh(
                    new IcosahedronGeometry(),
                    new MeshBasicMaterial()
                )
                cube.scale.setScalar(0.01)
                cube.position.copy(position)
                this.visual.scene.add(cube)
            })
            */

            this.branches.push({
                startDistance: branchCurve.getDistanceFromPoint(
                    branchStartingPosition
                ),
                curve: branchCurve,
                timeline: branchTimeline,
            })

            this.mainCurveTimeline.sync(
                branchTimeline,
                mainCurvePoints.length * 0.8 * 1000
            )
        }

        this.selectedBranch = this.branches[0]

        this.mainCurve = new Curve(mainCurvePoints, false, 'centripetal', 0.4)
        this.animate()
    }

    private animate() {
        requestAnimationFrame(() => this.animate())
        /*
        this.position += this.velocity
        this.velocity -= this.velocity * 0.04
        this.position = Math.max(0, this.position)
        */

        this.state.distance += 0.02

        if (this.selectedBranch) {
            this.selectedBranch.curve.getPointFromDistance(
                this.state.distance,
                this.cameraHelper.position
            )
            const tangent = this.selectedBranch.curve.getTangentFromDistance(
                this.state.distance
            )
            this.cameraHelper.setDirection(tangent)
            this.state.distance %= this.selectedBranch.curve.getLength() - 1
        } else {
            this.mainCurve.getPointFromDistance(
                this.state.distance,
                this.cameraHelper.position
            )
            const tangent = this.mainCurve.getTangentFromDistance(
                this.state.distance
            )
            this.cameraHelper.setDirection(tangent)
        }
        /*.set(
            Math.asin(tangent.y),
            Math.atan2(-tangent.x, -tangent.z),
            0
        )*/

        this.materialManager.updateVisualBasedMaterialUniforms()

        this.visual.render()
    }
}

new Application()
