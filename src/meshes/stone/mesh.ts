import { StoneGeometry } from '@/geometries'
import { StoneMaterial } from '@/materials'
import { Mesh, Shape, Vector3 } from 'three'

export class StoneMesh extends Mesh {
    constructor(shape: Shape, height: number) {
        super(new StoneGeometry(shape, height), new StoneMaterial(height))

        const position = new Vector3()
        this.geometry.computeBoundingBox()
        this.geometry.boundingBox?.getCenter(position)
        this.geometry.center()

        this.position.add(position)
    }
}
