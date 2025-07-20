import { IcosahedronGeometry, Mesh, Vector3 } from 'three'
import './index.scss'
import { Visual } from './visual'
import { MaterialManager } from './material_manager'
import { PathObject, PATH_OBJECT_RADIUS } from './objects/path'
import { CSS3DObject } from 'three/examples/jsm/Addons.js'
import { Curve } from './curve'
import { Portfolio } from './portfolio'
import Stats from 'stats.js'
import { Timeline } from 'animejs'

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
    private visual: Visual
    private materialManager: MaterialManager
    private branches: Branch[]
    private mainCurve: Curve
    private mainCurveTimeline: Timeline
    private state: State
    private lastRenderTimestamp: number
    private selectedBranch: Branch | null

    constructor() {
        this.visual = new Visual({})
        this.materialManager = new MaterialManager({ visual: this.visual })
        this.branches = []
        this.state = {
            distance: 3,
            velocity: 0,
            location: 'main',
        }

        const sky = new Mesh(
            new IcosahedronGeometry(100, 1),
            this.materialManager.getSkyMaterial()
        )
        this.visual.add(sky)

        this.mainCurve = new Curve()
        this.mainCurveTimeline = new Timeline({ autoplay: false })

        for (let i = 0; i < Portfolio.introduction.length; i++) {
            const position = new Vector3(i * 2 * PATH_OBJECT_RADIUS)
            const object = new PathObject({
                materialManager: this.materialManager,
                type: 'straight',
            })
            object.position.copy(position)
            this.mainCurveTimeline.sync(object.timeline, i)
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
                Portfolio.introduction.length + s
            )
            this.visual.scene.add(path)

            const skillNameElement = createTemplateElement(
                `template__skill__${Portfolio.skills[s].id}`
            )
            const skillName = new CSS3DObject(skillNameElement)
            skillName.scale.setScalar(0.005)
            skillName.position.copy(position)
            skillNameElement.style.opacity = '0'
            skillName.rotateY(angle - Math.PI / 2.1)
            this.visual.add(skillName)
            this.mainCurveTimeline
                .add(
                    skillName.position,
                    {
                        y: [-1, POSTER_ALTITUDE],
                        duration: 1,
                    },
                    Portfolio.introduction.length + s + 1
                )
                .add(
                    skillNameElement.style,
                    {
                        opacity: [0, 1],
                        duration: 1,
                    },
                    '<<+=0'
                )
                .add(
                    skillNameElement.style,
                    { opacity: { to: 0, duration: 0.2 } },
                    '<+=1'
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
                branchCurveTimeline.sync(path.timeline, b)
                this.visual.scene.add(path)

                branchCurve.addSegment((i) => {
                    return {
                        position: branchCurveCenter
                            .clone()
                            .add(
                                new Vector3(
                                    -Math.sin(
                                        angle - (i * Math.PI) / 4 + Math.PI / 4
                                    ),
                                    0,
                                    -Math.cos(
                                        angle - (i * Math.PI) / 4 + Math.PI / 4
                                    )
                                )
                                    .multiplyScalar(
                                        PATH_OBJECT_RADIUS * 2.41421356
                                    )
                                    .setY(CAMERA_ALTITUDE)
                            ),
                        direction: new Vector3(
                            Math.cos(angle - (i * Math.PI) / 4 + Math.PI / 4),
                            0,
                            -Math.sin(angle - (i * Math.PI) / 4 + Math.PI / 4)
                        ),
                    }
                })
            }

            this.branches.push({
                startDistance: Portfolio.introduction.length + s,
                curve: branchCurve,
                timeline: branchCurveTimeline,
            })
        }

        this.selectedBranch = this.branches[1]

        /*
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
        */

        this.lastRenderTimestamp = Date.now()
        this.animate()

        document.addEventListener('wheel', (event) => {
            this.state.velocity =
                Math.sign(event.deltaY) *
                (0.0006 + Math.abs(this.state.velocity) * 0.8)
        })
    }

    private animate() {
        stats.begin()

        const deltaTime = Date.now() - this.lastRenderTimestamp

        this.state.distance = Math.max(
            this.state.distance + this.state.velocity * deltaTime,
            0
        )

        const DEACCELERATION = 0.005
        this.state.velocity -= this.state.velocity * DEACCELERATION * deltaTime
        if (Math.abs(this.state.velocity) < 0.0001) this.state.velocity = 0

        const [cameraPoint, error] =
            this.selectedBranch &&
            this.state.distance > this.selectedBranch.startDistance
                ? this.selectedBranch.curve.getPoint(
                      Math.min(
                          this.state.distance -
                              this.selectedBranch.startDistance,
                          this.selectedBranch.curve.length - 1
                      )
                  )
                : this.mainCurve.getPoint(
                      Math.min(this.state.distance, this.mainCurve.length - 1)
                  )
        if (error !== null) throw error
        this.visual.camera.position.copy(cameraPoint.position)
        this.visual.camera.lookAt(
            cameraPoint.position.add(cameraPoint.direction)
        )

        if (
            this.selectedBranch &&
            this.state.distance > this.selectedBranch.startDistance + 2
        ) {
            this.mainCurveTimeline.init()
        } else {
            this.mainCurveTimeline.seek(this.state.distance + 3)
        }
        for (const branch of this.branches) {
            if (this.state.distance > branch.startDistance - 2) {
                if (
                    branch == this.selectedBranch ||
                    this.state.distance < branch.startDistance - 1
                ) {
                    branch.timeline.seek(
                        branch.timeline.currentTime +
                            (this.state.distance -
                                branch.startDistance +
                                2 -
                                branch.timeline.currentTime) *
                                0.2
                    )
                } else if (this.state.distance > branch.startDistance) {
                    branch.timeline.seek(0)
                }
            }
        }

        this.materialManager.updateVisualBasedMaterialUniforms()

        this.visual.render()
        this.lastRenderTimestamp = Date.now()
        stats.end()
        requestAnimationFrame(() => this.animate())
    }
}

new Application()

class TemplateElementNotFoundError extends Error {
    constructor(id: string) {
        super(`Template element '#${id}' not found`)
    }
}

class EmptyTemplateElementError extends Error {
    constructor(id: string) {
        super(`Empty template element '#${id}'`)
    }
}

function createTemplateElement<T extends HTMLElement>(id: string): T {
    const template = document.getElementById(id) as HTMLTemplateElement | null
    if (!template) throw new TemplateElementNotFoundError(id)
    const children = (template.content.cloneNode(true) as any).children
    if (children.length === 0) throw new EmptyTemplateElementError(id)
    return children[0]
}
