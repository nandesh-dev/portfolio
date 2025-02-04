import { ExtrudeGeometry, Shape } from "three";

export class StoneGeometry extends ExtrudeGeometry {
  constructor(shape: Shape, height: number) {
    super(shape, {
      bevelEnabled: false,
      depth: height,
    });

    this.rotateX(Math.PI / 2);
  }
}
