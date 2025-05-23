import { Group } from 'three'
import { OBJLoader } from 'three/examples/jsm/Addons.js'
import type { MaterialManager } from '../material_manager'
import { DOMCSSColorNames, type DOMCSSColorName } from '../dom'

type OBJModel = string

export type BlenderExportedObjectParameters = {
    model: OBJModel
    materialManager: MaterialManager
}

export class BlenderExportedObject extends Group {
    constructor(parameters: BlenderExportedObjectParameters) {
        super()

        const object = new OBJLoader()
            .setMaterials({
                create: (name: string) => {
                    if ((DOMCSSColorNames as readonly string[]).includes(name)) {
                        return parameters.materialManager.getRandomShadeObjectMaterial(name as DOMCSSColorName)
                    }

                    throw new Error(`Unknown material: '${name}'`)
                },
            } as any)
            .parse(parameters.model)

        this.copy(object, true)
    }
}
