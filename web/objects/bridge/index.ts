import { BlenderExportedObject, type BlenderExportedObjectParameters } from '../blender_exported'
import model from './model.obj?raw'

export type BridgeObjectParameters = Omit<BlenderExportedObjectParameters, 'model' | 'materialRoughness'>

export class BridgeObject extends BlenderExportedObject {
    constructor(parameters: BridgeObjectParameters) {
        super({ ...parameters, model, materialRoughness: 0.9 })
    }
}
