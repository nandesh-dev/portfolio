import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

export class Path extends Mesh {
    constructor() {
        super(new BoxGeometry(), new MeshBasicMaterial())
    }
}
