import { Group } from 'three'
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

export type PathObjectType = 'straight' | 'right' | 'left' | 'branch'

export type PathObjectParameters = Omit<
    BlenderExportedObjectParameters,
    'model' | 'materialRoughness'
> & {
    type: PathObjectType
}

export class PathObject extends Group {
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
            this.add(
                new BlenderExportedObject({
                    ...parameters,
                    model,
                    materialRoughness,
                })
            )
        }
    }
}

export const PathObjectRadius = 4.3 / 2
