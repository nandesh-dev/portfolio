import { Group, Mesh, Sphere } from 'three'
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

        this.timeline = new Timeline().pause()
        this.children.forEach((child) => {
            const mesh = child as Mesh
            if (!mesh.isMesh) throw Error('Unknown object, mesh expected')
            mesh.geometry.computeBoundingSphere()
            const offset = (mesh.geometry.boundingSphere as Sphere).center.x
            this.timeline.add(
                mesh.position,
                { y: [-10, -1, 0], duration: 1000 },
                offset * 0.2 * 1000 + Math.random() * 250 + 250
            )
        })
        this.timeline.reset()
    }
}

export const PathObjectRadius = 4.3 / 2
