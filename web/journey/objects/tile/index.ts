import raw from './tile.obj?raw'
import { Group, Mesh } from 'three'
import { OBJLoader } from 'three/examples/jsm/Addons.js'
import { ObjectShader } from '../../shader/object'

export class Tile extends Group {
  constructor() {
    super()
    const object = new OBJLoader().parse(raw)
    object.traverse((obj) => {
      if (obj instanceof Mesh) {
        obj.material = new ObjectShader()
      }
    })
    this.add(object)
  }
}
