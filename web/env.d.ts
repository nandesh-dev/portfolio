/// <reference types="vite/client" />

declare module '*.obj?raw' {
  const content: string
  export default content
}

declare module '*.glsl?raw' {
  const content: string
  export default content
}
