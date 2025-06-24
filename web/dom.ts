import { Color } from 'three'
import { Portfolio } from './portfolio'

export type DOMElements = {
    renderer: {
        webGL: HTMLCanvasElement
        css3D: HTMLDivElement
    }
    template: {
        skill: {
            [name: string]: HTMLTemplateElement
        }
    }
    overlay: {
        guide: {
            branchSwitch: HTMLDivElement
        }
    }
}

export const DOMCSSColorNames = [
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
export const DOMCSSColorShadeNames = ['original', 'plus', 'minus'] as const
export const DOMCSSColorShadeHueOffset = (0.4 / 180) * Math.PI

export type DOMCSSColorName = (typeof DOMCSSColorNames)[number]
export type DOMCSSColorShadeName = (typeof DOMCSSColorShadeNames)[number]

export type DOMCSSColors = {
    [name in DOMCSSColorName]: {
        [shade in DOMCSSColorShadeName]: {
            light: Color
            dark: Color
        }
    }
}

export type DOMCSS = {
    colors: DOMCSSColors
}

export type DOMEventListeners = {
    cssupdate: (css: DOMCSS) => void
}

export class DOM {
    public elements: DOMElements
    public css: DOMCSS

    private eventListeners: {
        [name in keyof DOMEventListeners]: DOMEventListeners[name][]
    }

    constructor() {
        this.elements = this.getElements()
        this.css = this.getCSS()

        this.eventListeners = { cssupdate: [] }

        window
            .matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {
                this.css.colors = this.getCSSColors()
                for (const listener of this.eventListeners.cssupdate) {
                    listener(this.css)
                }
            })
    }

    private getElements(): DOMElements {
        const webGLRenderer = document.getElementById(
            'renderer__webgl'
        ) as HTMLCanvasElement
        if (!webGLRenderer) throw new Error('WebGL Renderer element not found')

        const css3DRenderer = document.getElementById(
            'renderer__css3d'
        ) as HTMLDivElement
        if (!css3DRenderer) throw new Error('CSS3D Renderer element not found')

        const template: DOM['elements']['template'] = { skill: {} }
        Portfolio.skills.forEach(({ id }) => {
            const element = document.getElementById(
                `template__skill__${id}`
            ) as HTMLTemplateElement
            if (!element)
                throw new Error(`Skill template element for '${id}' not found`)
            template.skill[id] = element
        })

        const overlayGuideBranchSwitch = document.getElementById(
            'overlay__guide__branch-switch'
        ) as HTMLDivElement
        if (!overlayGuideBranchSwitch)
            throw new Error(`Overlay guide branch-switch element not found`)
        const overlay = { guide: { branchSwitch: overlayGuideBranchSwitch } }

        return {
            renderer: { webGL: webGLRenderer, css3D: css3DRenderer },
            template,
            overlay,
        }
    }

    private getCSS(): DOMCSS {
        const colors = this.getCSSColors()

        return { colors }
    }

    private getCSSColors(): DOMCSSColors {
        const computedStyle = getComputedStyle(document.body)

        return DOMCSSColorNames.reduce((colors, name) => {
            const darkCSSVariable = computedStyle.getPropertyValue(
                `--theme-color-${name}__dark`
            )
            if (!darkCSSVariable)
                throw new Error(`Color ${name} dark not found`)
            let dark = new Color(darkCSSVariable).convertLinearToSRGB()

            const lightCSSVariable = computedStyle.getPropertyValue(
                `--theme-color-${name}__light`
            )
            if (!lightCSSVariable)
                throw new Error(`Color ${name} light not found`)
            const light = new Color(lightCSSVariable).convertLinearToSRGB()

            colors[name] = {
                original: { dark, light },
                plus: {
                    dark: dark
                        .clone()
                        .offsetHSL(DOMCSSColorShadeHueOffset, 0, 0),
                    light: light
                        .clone()
                        .offsetHSL(DOMCSSColorShadeHueOffset, 0, 0),
                },
                minus: {
                    dark: dark
                        .clone()
                        .offsetHSL(-DOMCSSColorShadeHueOffset, 0, 0),
                    light: light
                        .clone()
                        .offsetHSL(-DOMCSSColorShadeHueOffset, 0, 0),
                },
            }

            return colors
        }, {} as DOMCSSColors)
    }

    public addEventListener<K extends keyof DOMEventListeners>(
        name: K,
        listener: DOMEventListeners[K]
    ) {
        this.eventListeners[name].push(listener)
    }
}
