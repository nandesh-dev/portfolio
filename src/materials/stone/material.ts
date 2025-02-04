import FragmentGLSL from "./fragment.glsl?raw";
import VertexGLSL from "./vertex.glsl?raw";
import { Color, ShaderMaterial, TextureLoader } from "three";

export class StoneMaterial extends ShaderMaterial {
  constructor(height: number) {
    const textureLoader = new TextureLoader();
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
