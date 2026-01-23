/// <reference types="vite/client" />

interface ImportMetaEnv {
  // SSO/Identity Provider (for future authentication)
  readonly VITE_IDENTITY_URL?: string

  readonly VITE_API_BASE_URL: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
