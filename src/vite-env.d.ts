/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ACCESS_PASSWORD: string
  // 可以添加更多环境变量的类型声明
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
