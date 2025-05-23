import { Color } from 'three'

export type DOMElements = {
    canvas: HTMLCanvasElement
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

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            this.css.colors = this.getCSSColors()
            for (const listener of this.eventListeners.cssupdate) {
                listener(this.css)
            }
        })
    }

    private getElements(): DOMElements {
        const canvas = document.querySelector('canvas')
        if (!canvas) throw new Error('Canvas element not found')

        return { canvas }
    }

    private getCSS(): DOMCSS {
        const colors = this.getCSSColors()

        return { colors }
    }

    private getCSSColors(): DOMCSSColors {
        const computedStyle = getComputedStyle(document.body)

        return DOMCSSColorNames.reduce((colors, name) => {
            const darkCSSVariable = computedStyle.getPropertyValue(`--theme-color-${name}__dark`)
            if (!darkCSSVariable) throw new Error(`Color ${name} dark not found`)
            let dark = new Color(darkCSSVariable).convertLinearToSRGB()

            const lightCSSVariable = computedStyle.getPropertyValue(`--theme-color-${name}__light`)
            if (!lightCSSVariable) throw new Error(`Color ${name} light not found`)
            const light = new Color(lightCSSVariable).convertLinearToSRGB()

            colors[name] = {
                original: { dark, light },
                plus: {
                    dark: dark.clone().offsetHSL(DOMCSSColorShadeHueOffset, 0, 0),
                    light: light.clone().offsetHSL(DOMCSSColorShadeHueOffset, 0, 0),
                },
                minus: {
                    dark: dark.clone().offsetHSL(-DOMCSSColorShadeHueOffset, 0, 0),
                    light: light.clone().offsetHSL(-DOMCSSColorShadeHueOffset, 0, 0),
                },
            }

            return colors
        }, {} as DOMCSSColors)
    }

    public addEventListener<K extends keyof DOMEventListeners>(name: K, listener: DOMEventListeners[K]) {
        this.eventListeners[name].push(listener)
    }
}
