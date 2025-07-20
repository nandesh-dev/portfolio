import { Color, Vector3 } from 'three'
import { ObjectMaterial } from './materials/object'
import { SkyMaterial } from './materials/sky'
import type { Visual } from './visual'
import { animate } from 'animejs'

export const ColorNames = [
    'gray',
    'yellow',
    'orange',
    'red',
    'purple',
    'blue',
    'sky',
    'green',
    'background',
    'text',
] as const
export const ColorShadeNames = ['original', 'plus', 'minus'] as const
export const ColorThemeNames = ['dark', 'light'] as const
export const ColorShadeHueOffset = (0.4 / 180) * Math.PI

export type ColorName = (typeof ColorNames)[number]
export type ColorShadeName = (typeof ColorShadeNames)[number]
export type ColorThemeName = (typeof ColorThemeNames)[number]
export type CSSColorVariables = {
    [name in ColorName]: {
        [shade in ColorShadeName]: {
            light: Color
            dark: Color
        }
    }
}

export class CSSVariableNotFoundError extends Error {
    constructor(name: string) {
        super(`CSS Variable '${name}' not found`)
    }
}

export type MaterialManagerParameters = {
    visual: Visual
}

export class MaterialManager {
    private colors: CSSColorVariables
    private visual: Visual
    private materials: {
        objects: Map<
            {
                color: ColorName
                shade: ColorShadeName
                roughness: number
            },
            ObjectMaterial
        >
        sky: SkyMaterial
    }

    constructor(parameters: MaterialManagerParameters) {
        this.colors = getCSSColorVariables()
        this.visual = parameters.visual
        this.materials = {
            objects: new Map(),
            sky: new SkyMaterial({
                color: {
                    sky: {
                        light: this.colors.background.original.light.clone(),
                        dark: this.colors.background.original.dark.clone(),
                    },
                    fog: this.colors.background.original.dark.clone(),
                },
                camera: {
                    position: this.visual.camera.position.clone(),
                },
            }),
        }

        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {
                this.updateColorBasedMaterialUniforms()
            })
    }

    public getRandomShadeObjectMaterial(
        color: ColorName,
        roughness: number
    ): ObjectMaterial {
        const shade =
            ColorShadeNames[Math.floor(Math.random() * ColorShadeNames.length)]

        let material = this.materials.objects.get({ color, shade, roughness })
        if (!material) {
            material = new ObjectMaterial({
                color: {
                    object: {
                        light: this.colors[color][shade].light.clone(),
                        dark: this.colors[color][shade].dark.clone(),
                    },
                    fog: this.colors.background.original.dark.clone(),
                },
                roughness,
                camera: {
                    position: this.visual.camera.position.clone(),
                },
                sun: {
                    position: new Vector3(20, 20, 20),
                },
            })

            this.materials.objects.set({ color, shade, roughness }, material)
        }

        return material
    }

    public getSkyMaterial(): SkyMaterial {
        return this.materials.sky
    }

    private updateColorBasedMaterialUniforms() {
        this.materials.objects.forEach((material) => {
            animate(material.parameters.color.fog, {
                ...this.colors.background.original.dark.clone(),
                onRender: () => material.recalculateUniforms(),
            })
        })

        animate(this.materials.sky.parameters.color.sky.light, {
            ...this.colors.background.original.light.clone(),
            onRender: () => this.materials.sky.recalculateUniforms(),
        })

        animate(this.materials.sky.parameters.color.sky.dark, {
            ...this.colors.background.original.dark.clone(),
            onRender: () => this.materials.sky.recalculateUniforms(),
        })

        animate(this.materials.sky.parameters.color.fog, {
            ...this.colors.background.original.dark.clone(),
            onRender: () => this.materials.sky.recalculateUniforms(),
        })
    }

    public updateVisualBasedMaterialUniforms() {
        this.materials.objects.forEach((material) => {
            material.parameters.camera.position.copy(
                this.visual.camera.position
            )
            material.recalculateUniforms()
        })

        this.materials.sky.parameters.camera.position.copy(
            this.visual.camera.position
        )
        this.materials.sky.recalculateUniforms()
    }
}

function getCSSColorVariables(): CSSColorVariables {
    const computedStyle = getComputedStyle(document.body)

    return ColorNames.reduce((colors, name) => {
        const themes = ColorThemeNames.reduce(
            (themes, theme) => {
                const variable = computedStyle.getPropertyValue(
                    `--theme-color-${name}__${theme}`
                )
                if (!variable)
                    throw new CSSVariableNotFoundError(
                        `--theme-color-${name}__${theme}`
                    )
                let color = new Color(variable).convertLinearToSRGB()
                themes[theme] = color

                return themes
            },
            {} as { [theme in ColorThemeName]: Color }
        )

        colors[name] = {
            original: { dark: themes.dark, light: themes.light },
            plus: {
                dark: themes.dark.clone().offsetHSL(ColorShadeHueOffset, 0, 0),
                light: themes.light
                    .clone()
                    .offsetHSL(ColorShadeHueOffset, 0, 0),
            },
            minus: {
                dark: themes.dark.clone().offsetHSL(-ColorShadeHueOffset, 0, 0),
                light: themes.light
                    .clone()
                    .offsetHSL(-ColorShadeHueOffset, 0, 0),
            },
        }

        return colors
    }, {} as CSSColorVariables)
}
