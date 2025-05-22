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

    public updateParameters(parameters: SkyMaterialParameters) {
        this.parameters = parameters

        this.uniforms.uObjectColorLight.value = parameters.color.light
        this.uniforms.uObjectColorDark.value = parameters.color.dark
    }
}
