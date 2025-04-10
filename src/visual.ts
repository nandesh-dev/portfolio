import { PerspectiveCamera, Scene as ThreeScene, Vector3 } from 'three'
import { Renderer } from './renderer'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

const journey = {
    length: 10,
    branches: {},
}

class WeightedArray<T> {
    private data: Map<T, number>
    constructor(items: T[]) {
        this.data = new Map()

        for (const item of items) {
            this.data.set(item, 1)
        }
    }

    increaseWeight(item: T, weight: number) {
        this.data.set(item, this.data.get(item) || 1 + weight)
    }

    setWeight(item: T, weight: number) {
        this.data.set(item, weight)
    }

    random() {
        let weightSum = 0
        for (const weight of this.data.values()) {
            weightSum += weight
        }

        const selectedIndex = Math.floor(Math.random() * weightSum)
        weightSum = 0
        for (const [item, weight] of this.data.entries()) {
            weightSum += weight

            if (weightSum >= selectedIndex) {
                return item
            }
        }

        throw new Error('How did we get here?')
    }

    forEach(callback: (item: T, value: number) => void) {
        for (const [item, weight] of this.data.entries()) {
            callback(item, weight)
        }
    }
}

export class Path extends Mesh {
    constructor() {
        super(new BoxGeometry(), new MeshBasicMaterial({ color: 'pink' }))
    }
}

function delay(delay: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, delay)
    })
}

class Scene extends ThreeScene {
    constructor() {
        super()
    }

    public async generate() {
        const path = new Path()
        this.add(path)

        for (let i = 1; i < 10; i++) {
            const possibleAngleWeightMap = new WeightedArray(
                [0, 60, 120, 180, 270, 360].map((a) => (a / 180) * Math.PI)
            )

            possibleAngleWeightMap.forEach((angle) => {
                const position = new Vector3(Math.cos(angle), 0, Math.sin(angle)).multiplyScalar(10)
                for (const child of this.children) {
                    const distance = child.position.distanceTo(position)
                    possibleAngleWeightMap.increaseWeight(angle, distance)
                }
            })

            const selectedAngle = possibleAngleWeightMap.random()
            const path = new Path()
            path.position.add(this.children[i - 1].position)

            path.rotation.y = -selectedAngle
            path.position.x = Math.cos(selectedAngle) * 10
            path.position.z = Math.sin(selectedAngle) * 10

            console.log(path.position)

            this.add(path)

            await delay(1000)
        }
    }
}

class Visual {
    public domElement = document.createElement('div')
    private resizeObserver: ResizeObserver
    private scene = new Scene()
    private camera = new PerspectiveCamera()
    private renderer = new Renderer()
    constructor() {
        this.domElement.classList.add('visual')
        this.domElement.append(this.renderer.domElement)

        this.resizeObserver = new ResizeObserver(([entry]) => {
            this.renderer.setSize(entry.target.clientWidth, entry.target.clientHeight)
        })
        this.resizeObserver.observe(this.domElement)

        this.camera.position.y = 100
        this.camera.lookAt(0, 0, 0)
        this.scene.generate()

        this.startAnimation()
    }

    private startAnimation() {
        const animate = () => {
            requestAnimationFrame(() => animate())

            this.renderer.render(this.scene, this.camera)
        }

        animate()
    }
}

const visual = new Visual()
document.body.append(visual.domElement)
