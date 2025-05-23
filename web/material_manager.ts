import { Vector3 } from 'three'
import { DOMCSSColorShadeNames, type DOM, type DOMCSSColorName, type DOMCSSColorShadeName } from './dom'
import { ObjectMaterial } from './materials/object'
import { SkyMaterial } from './materials/sky'
import type { Visual } from './visual'
import { animate } from 'animejs'

export type MaterialManagerParameters = {
    dom: DOM
    visual: Visual
}

export class MaterialManager {
    private dom: DOM
    private visual: Visual
    private materials: {
        objects: Map<{ color: DOMCSSColorName; shade: DOMCSSColorShadeName }, ObjectMaterial>
        sky: SkyMaterial
    }

    constructor(parameters: MaterialManagerParameters) {
        this.dom = parameters.dom
        this.visual = parameters.visual
        this.materials = {
            objects: new Map(),
            sky: new SkyMaterial({
                color: {
                    light: this.dom.css.colors.background.light.clone(),
                    dark: this.dom.css.colors.background.dark.clone(),
                },
            }),
        }

        this.dom.addEventListener('cssupdate', () => {
            this.updateColorBasedMaterialUniforms()
        })
    }

    public getRandomShadeObjectMaterial(color: DOMCSSColorName): ObjectMaterial {
        const shade = DOMCSSColorShadeNames[Math.floor(Math.random() * DOMCSSColorShadeNames.length)]

        let material = this.materials.objects.get({ color, shade })
        if (!material) {
            material = new ObjectMaterial({
                color: {
                    object: {
                        light: this.dom.css.colors[color].light.clone(),
                        dark: this.dom.css.colors[color].dark.clone(),
                    },
                    fog: this.dom.css.colors.background.dark.clone(),
                },
                roughness: 0.8,
                camera: {
                    position: this.visual.camera.position.clone(),
                },
                sun: {
                    position: new Vector3(500, 500, 500),
                    intensity: 1000000,
                },
            })

            this.materials.objects.set({ color, shade }, material)
        }

        return material
    }

    public getSkyMaterial(): SkyMaterial {
        return this.materials.sky
    }

    private updateColorBasedMaterialUniforms() {
        this.materials.objects.forEach((material) => {
            animate(material.parameters.color.fog, {
                ...this.dom.css.colors.background.dark.clone(),
                onRender: () => material.recalculateUniforms(),
            })
        })

        animate(this.materials.sky.parameters.color.light, {
            ...this.dom.css.colors.background.light.clone(),
            onRender: () => this.materials.sky.recalculateUniforms(),
        })

        animate(this.materials.sky.parameters.color.dark, {
            ...this.dom.css.colors.background.dark.clone(),
            onRender: () => this.materials.sky.recalculateUniforms(),
        })
    }

    public updateVisualBasedMaterialUniforms() {
        this.materials.objects.forEach((material) => {
            material.parameters.camera.position.copy(this.visual.camera.position)
            material.recalculateUniforms()
        })
    }
}
