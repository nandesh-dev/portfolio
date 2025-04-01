type Properties = {
    class?: string
    style?: Partial<CSSStyleDeclaration>
}

function createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    prop: Properties,
    ...children: (HTMLElement | string)[]
) {
    const element = document.createElement(tag)

    if (prop.style) {
        Object.assign(element.style, prop.style)
    }

    if (prop.class) {
        element.className = prop.class
    }

    for (const child of children) {
        if (typeof child == 'string') {
            element.innerText = child
        } else {
            element.appendChild(child)
        }
    }

    return element
}

function createTagedElementFunction<T extends keyof HTMLElementTagNameMap>(
    tag: T
) {
    return (prop: Properties, ...children: (HTMLElement | string)[]) =>
        createElement(tag, prop, ...children)
}

export const div = createTagedElementFunction('div')
export const p = createTagedElementFunction('p')
