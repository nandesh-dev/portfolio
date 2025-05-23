import { BackSide, Color, ShaderMaterial, Vector3 } from 'three'
import fragmentShader from './fragment.glsl?raw'
import vertexShader from './vertex.glsl?raw'

export type SkyMaterialParameters = {
    color: {
        sky: {
            light: Color
            dark: Color
        }
        fog: Color
    }
    camera: {
        position: Vector3
    }
}

export class SkyMaterial extends ShaderMaterial {
    public parameters: SkyMaterialParameters

    constructor(parameters: SkyMaterialParameters) {
        super({
            vertexShader,
            fragmentShader,
            uniforms: {
                uSkyColorLight: { value: parameters.color.sky.light },
                uSkyColorDark: { value: parameters.color.sky.dark },
                uFogColor: { value: parameters.color.fog },
                uCameraPosition: { value: parameters.camera.position },
            },
            side: BackSide,
        })

        this.parameters = parameters
    }

    public recalculateUniforms() {
        this.uniforms.uSkyColorLight.value = this.parameters.color.sky.light
        this.uniforms.uSkyColorDark.value = this.parameters.color.sky.dark
        this.uniforms.uFogColor.value = this.parameters.color.fog
        this.uniforms.uCameraPosition.value = this.parameters.camera.position
    }
}
