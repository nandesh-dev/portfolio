import vertexShader from './vertex.glsl?raw'
import fragmentShader from './fragment.glsl?raw'
import { ShaderMaterial, UniformsLib, Vector3 } from 'three'

export class ObjectShader extends ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        ...UniformsLib.fog,
        uColor: {
          value: new Vector3(139 + Math.random() * 10, 220 + Math.random() * 20, 255).divideScalar(255),
        },
      },
      fog: true,
    })
  }
}
