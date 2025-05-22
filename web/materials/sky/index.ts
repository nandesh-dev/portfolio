import { BackSide, Color, ShaderMaterial } from 'three'
import fragmentShader from './fragment.glsl?raw'
import vertexShader from './vertex.glsl?raw'

export type SkyMaterialParameters = {
    color: {
        light: Color
        dark: Color
    }
}

export class SkyMaterial extends ShaderMaterial {
    public parameters: SkyMaterialParameters

    constructor(parameters: SkyMaterialParameters) {
        super({
            vertexShader,
            fragmentShader,
            uniforms: {
                uColorLight: { value: parameters.color.light },
                uColorDark: { value: parameters.color.dark },
            },
            side: BackSide,
        })

        this.parameters = parameters
    }

    public recalculateUniforms() {
        this.uniforms.uColorLight.value = this.parameters.color.light
        this.uniforms.uColorDark.value = this.parameters.color.dark
    }
}
