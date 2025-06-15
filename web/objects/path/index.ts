import { Group, Mesh, Sphere, Vector3 } from 'three'
import {
    BlenderExportedObject,
    type BlenderExportedObjectParameters,
} from '../blender_exported'
import modelA from './model_a.obj?raw'
import modelB from './model_b.obj?raw'
import modelC from './model_c.obj?raw'
import modelD from './model_d.obj?raw'
import modelE from './model_e.obj?raw'
import modelF from './model_f.obj?raw'
import modelG from './model_g.obj?raw'
import { Timeline } from 'animejs'

export const PATH_OBJECT_RADIUS = 4.3 / 2
export const PATH_OBJECT_ANIMATION_TIME = 1.2 * 1000
export const PATH_OBJECT_TOTAL_ANIMATION_TIME = 1.5 * PATH_OBJECT_ANIMATION_TIME

export type PathObjectType = 'straight' | 'right' | 'left' | 'branch'

export type PathObjectParameters = Omit<
    BlenderExportedObjectParameters,
    'model' | 'materialRoughness'
> & {
    type: PathObjectType
}

export class PathObject extends Group {
    public timeline: Timeline
    constructor(parameters: PathObjectParameters) {
        super()

        const materialRoughness = 0.4

        let models
        switch (parameters.type) {
            case 'straight':
                models = [modelA, modelD, modelE, modelF, modelG]
                break
            case 'left':
                models = [modelA, modelB, modelD, modelE]
                break
            case 'right':
                models = [modelA, modelC, modelD, modelF]
                break
            case 'branch':
                models = [modelA, modelB, modelC, modelD, modelE, modelF]
                break
        }

        for (const model of models) {
            const object = new BlenderExportedObject({
                ...parameters,
                model,
                materialRoughness,
            })

            while (object.children.length) {
                this.add(object.children[0])
            }
        }

        this.timeline = new Timeline({ autoplay: true })
        this.children.forEach((child) => {
            const mesh = child as Mesh
            if (!mesh.isMesh) throw Error('Unknown object, mesh expected')
            mesh.geometry.computeBoundingSphere()
            const offset =
                (0.5 +
                    (mesh.geometry.boundingSphere as Sphere).center.x /
                        (2 * PATH_OBJECT_RADIUS)) *
                PATH_OBJECT_ANIMATION_TIME
            this.timeline.add(
                mesh.position,
                {
                    y: [-10, -6, -2, 0],
                    duration: PATH_OBJECT_TOTAL_ANIMATION_TIME,
                },
                offset
            )
        })
        this.timeline.init()
    }
}
