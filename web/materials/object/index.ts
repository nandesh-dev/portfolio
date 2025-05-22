import { Color, ShaderMaterial, Vector3 } from 'three'
import fragmentShader from './fragment.glsl?raw'
import vertexShader from './vertex.glsl?raw'

export type ObjectMaterialParameters = {
    color: {
        object: {
            light: Color
            dark: Color
        }
        fog: Color
    }
    roughness: number
    camera: {
        position: Vector3
    }
    sun: {
        position: Vector3
        intensity: number
    }
}

export class ObjectMaterial extends ShaderMaterial {
    public parameters: ObjectMaterialParameters

    constructor(parameters: ObjectMaterialParameters) {
        super({
            vertexShader,
            fragmentShader,
            uniforms: {
                uObjectColorLight: { value: parameters.color.object.light },
                uObjectColorDark: { value: parameters.color.object.dark },
                uFogColor: { value: parameters.color.fog },
                uRoughness: { value: parameters.roughness },
                uCameraPosition: { value: parameters.camera.position },
                uSunPosition: { value: parameters.sun.position },
                uSunIntensity: { value: parameters.sun.intensity },
            },
        })

        this.parameters = parameters
    }

    public recalculateUniforms() {
        this.uniforms.uObjectColorLight.value = this.parameters.color.object.light
        this.uniforms.uObjectColorDark.value = this.parameters.color.object.dark
        this.uniforms.uFogColor.value = this.parameters.color.fog
        this.uniforms.uRoughness.value = this.parameters.roughness
        this.uniforms.uCameraPosition.value = this.parameters.camera.position
        this.uniforms.uSunPosition.value = this.parameters.sun.position
        this.uniforms.uSunIntensity.value = this.parameters.sun.intensity
    }
}
