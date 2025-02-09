import FragmentGLSL from "./fragment.glsl?raw";
import VertexGLSL from "./vertex.glsl?raw";
import { Color, ShaderMaterial } from "three";

export class StoneMaterial extends ShaderMaterial {
  constructor(height: number) {
    super({
      uniforms: {
        uColor: { value: new Color("cyan") },
        uHeight: { value: height },
      },
      fragmentShader: FragmentGLSL,
      vertexShader: VertexGLSL,
    });
  }
}
