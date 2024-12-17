/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_ENDPOINT: string,
    readonly VITE_API_PORT: number,
    readonly VITE_UI_PORT: number
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
