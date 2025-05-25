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
                    sky: {
                        light: this.dom.css.colors.background.original.light.clone(),
                        dark: this.dom.css.colors.background.original.dark.clone(),
                    },
                    fog: this.dom.css.colors.background.original.dark.clone(),
                },
                camera: {
                    position: this.visual.camera.position.clone(),
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
                        light: this.dom.css.colors[color][shade].light.clone(),
                        dark: this.dom.css.colors[color][shade].dark.clone(),
                    },
                    fog: this.dom.css.colors.background.original.dark.clone(),
                },
                roughness: 0.6,
                camera: {
                    position: this.visual.camera.position.clone(),
                },
                sun: {
                    position: new Vector3(50, 50, 50),
                    intensity: 3000,
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
                ...this.dom.css.colors.background.original.dark.clone(),
                onRender: () => material.recalculateUniforms(),
            })
        })

        animate(this.materials.sky.parameters.color.sky.light, {
            ...this.dom.css.colors.background.original.light.clone(),
            onRender: () => this.materials.sky.recalculateUniforms(),
        })

        animate(this.materials.sky.parameters.color.sky.dark, {
            ...this.dom.css.colors.background.original.dark.clone(),
            onRender: () => this.materials.sky.recalculateUniforms(),
        })

        animate(this.materials.sky.parameters.color.fog, {
            ...this.dom.css.colors.background.original.dark.clone(),
            onRender: () => this.materials.sky.recalculateUniforms(),
        })
    }

    public updateVisualBasedMaterialUniforms() {
        this.materials.objects.forEach((material) => {
            material.parameters.camera.position.copy(this.visual.camera.position)
            material.recalculateUniforms()
        })

        this.materials.sky.parameters.camera.position.copy(this.visual.camera.position)
        this.materials.sky.recalculateUniforms()
    }
}
