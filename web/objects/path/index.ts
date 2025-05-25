import { BlenderExportedObject, type BlenderExportedObjectParameters } from '../blender_exported'
import model from './model.obj?raw'

export type PathObjectParameters = Omit<BlenderExportedObjectParameters, 'model'>

export class PathObject extends BlenderExportedObject {
    constructor(parameters: PathObjectParameters) {
        super({ ...parameters, model })
    }
}
