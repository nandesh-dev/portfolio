import { BlenderExportedObject, type BlenderExportedObjectParameters } from '../blender_exported'
import model from './model.obj?raw'

export type PathObjectParameters = Omit<BlenderExportedObjectParameters, 'model' | 'materialRoughness'>

export class PathObject extends BlenderExportedObject {
    constructor(parameters: PathObjectParameters) {
        super({ ...parameters, model, materialRoughness: 0.4 })
    }
}
