/// <reference types="vite/client" />

// Tell TypeScript that .glsl / .vert / .frag files are just strings
declare module '*.glsl?raw' { const src: string; export default src }
declare module '*.vert?raw' { const src: string; export default src }
declare module '*.frag?raw' { const src: string; export default src }
