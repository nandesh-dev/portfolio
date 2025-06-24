import { ArrowHelper, Color, IcosahedronGeometry, Mesh, Vector3 } from 'three'
import './index.scss'
import { DOM } from './dom'
import { Visual } from './visual'
import { MaterialManager } from './material_manager'
import {
    PathObject,
    PATH_OBJECT_ANIMATION_TIME,
    PATH_OBJECT_RADIUS,
} from './objects/path'
import { CSS3DObject, OrbitControls } from 'three/examples/jsm/Addons.js'
import { Curve } from './curve'
import { Portfolio } from './portfolio'
import Stats from 'stats.js'
import { Timeline, Timer } from 'animejs'

const USE_ORBIT_CONTROL = false
const CAMERA_ALTITUDE = 2
const POSTER_ALTITUDE = 1

document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.remove('transition-disabled')
})

document
    .getElementById('loading-screen')
    ?.classList.add('loading-screen--hidden')

var stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

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
    private mainCurve: Curve
    private mainCurveTimeline: Timeline
    private state: State
    private lastRenderTimestamp: number

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

        this.visual.camera.position.set(12, 10, 2)
        if (USE_ORBIT_CONTROL) {
            const control = new OrbitControls(this.visual.camera, document.body)
            control.enableZoom = false
            control.target.set(13, 1.5, 0)
            control.update()
        }

        this.mainCurve = new Curve()
        this.mainCurveTimeline = new Timeline({ autoplay: false })

        for (let i = 0; i < Portfolio.introduction.length; i++) {
            const position = new Vector3(i * 2 * PATH_OBJECT_RADIUS)
            const object = new PathObject({
                materialManager: this.materialManager,
                type: 'straight',
            })
            object.position.copy(position)
            this.mainCurveTimeline.sync(
                object.timeline,
                (i - 5) * PATH_OBJECT_ANIMATION_TIME
            )
            this.visual.add(object)

            this.mainCurve.addSegment((i) => {
                return {
                    position: new Vector3(
                        position.x +
                            i * 2 * PATH_OBJECT_RADIUS -
                            PATH_OBJECT_RADIUS,
                        CAMERA_ALTITUDE,
                        0
                    ),
                    direction: new Vector3(1, 0, 0),
                }
            })
        }

        const mainCurveCenter = new Vector3(
            Portfolio.introduction.length * 2 * PATH_OBJECT_RADIUS -
                PATH_OBJECT_RADIUS,
            0,
            -PATH_OBJECT_RADIUS * 2.41421356
        )
        for (let s = 0; s < Portfolio.skills.length; s++) {
            const angle = (s * Math.PI) / 4
            const position = mainCurveCenter
                .clone()
                .addScaledVector(
                    new Vector3(
                        Math.sin(angle + Math.PI / 8),
                        0,
                        Math.cos(angle + Math.PI / 8)
                    ),
                    PATH_OBJECT_RADIUS * 2.6131259
                )
            const path = new PathObject({
                materialManager: this.materialManager,
                type: s == Portfolio.skills.length - 1 ? 'right' : 'branch',
            })
            path.position.copy(position)
            path.rotateY(angle)
            this.mainCurveTimeline.sync(
                path.timeline,
                (this.mainCurve.length - 5) * PATH_OBJECT_ANIMATION_TIME
            )
            this.visual.scene.add(path)

            const skillNameElement = (
                this.dom.elements.template.skill[
                    Portfolio.skills[s].id
                ].content.cloneNode(true) as any
            ).children[0] as HTMLDivElement
            const skillName = new CSS3DObject(skillNameElement)
            skillName.scale.setScalar(0.005)
            skillName.position.copy(position)
            skillName.rotateY(angle - Math.PI / 2.1)
            this.visual.add(skillName)
            this.mainCurveTimeline
                .add(
                    skillName.position,
                    {
                        y: [-1, POSTER_ALTITUDE],
                        duration: PATH_OBJECT_ANIMATION_TIME,
                    },
                    (this.mainCurve.length - 3) * PATH_OBJECT_ANIMATION_TIME
                )
                .add(
                    skillNameElement.style,
                    {
                        opacity: [0, 1],
                        duration: PATH_OBJECT_ANIMATION_TIME,
                    },
                    (this.mainCurve.length - 3) * PATH_OBJECT_ANIMATION_TIME
                )
                .add(
                    skillNameElement.style,
                    { opacity: { to: 0 } },
                    (this.mainCurve.length - 0.5) * PATH_OBJECT_ANIMATION_TIME
                )

            this.mainCurve.addSegment((i) => {
                return {
                    position: mainCurveCenter
                        .clone()
                        .add(
                            new Vector3(
                                Math.sin(angle + (i * Math.PI) / 4),
                                0,
                                Math.cos(angle + (i * Math.PI) / 4)
                            )
                                .multiplyScalar(PATH_OBJECT_RADIUS * 2.41421356)
                                .setY(CAMERA_ALTITUDE)
                        ),
                    direction: new Vector3(
                        Math.cos(angle + (i * Math.PI) / 4),
                        0,
                        -Math.sin(angle + (i * Math.PI) / 4)
                    ),
                }
            })

            const branchCurveCenter = mainCurveCenter
                .clone()
                .addScaledVector(
                    new Vector3(Math.sin(angle), 0, Math.cos(angle)),
                    PATH_OBJECT_RADIUS * 2.41421356 * 2
                )
            const branchCurveTimeline = new Timeline({ autoplay: false })
            const branchCurve = new Curve()
            for (let b = 0; b < Portfolio.skills[s].articles.length; b++) {
                const angle = ((s - b) * Math.PI) / 4 - (1 * Math.PI) / 4
                const position = branchCurveCenter
                    .clone()
                    .addScaledVector(
                        new Vector3(
                            -Math.sin(angle - Math.PI / 8),
                            0,
                            -Math.cos(angle - Math.PI / 8)
                        ),
                        PATH_OBJECT_RADIUS * 2.6131259
                    )

                const path = new PathObject({
                    materialManager: this.materialManager,
                    type: 'right',
                })
                path.position.copy(position)
                path.rotateY(angle)
                branchCurveTimeline.sync(
                    path.timeline,
                    b * PATH_OBJECT_ANIMATION_TIME
                )
                this.visual.scene.add(path)

                branchCurve.addSegment((i) => {
                    return {
                        position: branchCurveCenter
                            .clone()
                            .add(
                                new Vector3(
                                    Math.sin(angle + (i * Math.PI) / 4),
                                    0,
                                    Math.cos(angle + (i * Math.PI) / 4)
                                )
                                    .multiplyScalar(
                                        PATH_OBJECT_RADIUS * 2.41421356
                                    )
                                    .setY(CAMERA_ALTITUDE)
                            ),
                        direction: new Vector3(
                            Math.cos(angle + (i * Math.PI) / 4),
                            0,
                            -Math.sin(angle + (i * Math.PI) / 4)
                        ),
                    }
                })
            }

            this.branches.push({
                startDistance: Portfolio.introduction.length + s,
                curve: branchCurve,
                timeline: branchCurveTimeline,
            })

            this.mainCurveTimeline.sync(
                branchCurveTimeline,
                (s - 1) * PATH_OBJECT_ANIMATION_TIME
            )
        }

        if (USE_ORBIT_CONTROL) {
            const cameraHelper = new ArrowHelper(
                new Vector3(1, 0, 0),
                new Vector3(0, 0, 0),
                2,
                new Color('cyan'),
                0.5,
                0.3
            )
            this.visual.add(cameraHelper)
            this.mainCurveTimeline.sync(
                new Timer({
                    autoplay: false,
                    onUpdate: (timer) => {
                        const distance =
                            timer.currentTime / PATH_OBJECT_ANIMATION_TIME
                        const [point, error] = this.mainCurve.getPoint(distance)
                        if (error !== null) {
                            console.warn(error)
                            return
                        }
                        cameraHelper.position.copy(point.position)
                        cameraHelper.setDirection(point.direction)
                    },
                }),
                0
            )
        } else {
            this.mainCurveTimeline.sync(
                new Timer({
                    autoplay: false,
                    onUpdate: (timer) => {
                        try {
                            const distance =
                                timer.currentTime / PATH_OBJECT_ANIMATION_TIME
                            const [point, error] =
                                this.mainCurve.getPoint(distance)
                            if (error !== null) {
                                throw error
                            }
                            this.visual.camera.position.copy(point.position)
                            this.visual.camera.lookAt(
                                point.position.add(point.direction)
                            )
                        } catch {}
                    },
                }),
                0
            )
        }

        this.mainCurveTimeline.sync(
            new Timer({
                onUpdate: (timer) => {
                    const distance =
                        timer.currentTime / PATH_OBJECT_ANIMATION_TIME
                    let insideBranchingZone = false
                    for (const branch of this.branches) {
                        if (
                            distance > branch.startDistance - 1 &&
                            distance < branch.startDistance
                        ) {
                            insideBranchingZone = true
                        }
                    }
                    if (insideBranchingZone)
                        this.dom.elements.overlay.guide.branchSwitch.classList.remove(
                            'overlay__guide__branch-switch--hidden'
                        )
                    else
                        this.dom.elements.overlay.guide.branchSwitch.classList.add(
                            'overlay__guide__branch-switch--hidden'
                        )
                },
            }),
            0
        )

        this.mainCurveTimeline.init()
        this.mainCurveTimeline.seek(0.0000000001)

        this.lastRenderTimestamp = Date.now()
        this.animate()

        document.addEventListener('wheel', (event) => {
            this.state.velocity =
                Math.sign(event.deltaY) *
                (1.2 + Math.abs(this.state.velocity) * 0.8)
        })
    }

    private animate() {
        stats.begin()

        const deltaTime = Date.now() - this.lastRenderTimestamp

        this.state.distance = Math.max(
            this.state.distance + this.state.velocity * deltaTime,
            0
        )

        const DEACCELERATION = 0.002
        this.state.velocity -= this.state.velocity * DEACCELERATION * deltaTime
        if (Math.abs(this.state.velocity) < 0.05) this.state.velocity = 0

        this.mainCurveTimeline.seek(this.state.distance)
        this.materialManager.updateVisualBasedMaterialUniforms()

        this.visual.render()
        this.lastRenderTimestamp = Date.now()
        stats.end()
        requestAnimationFrame(() => this.animate())
    }
}

new Application()
