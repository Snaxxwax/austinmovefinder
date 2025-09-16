/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUGGINGFACE_API_KEY: string
  readonly VITE_EMAILJS_SERVICE_ID: string
  readonly VITE_EMAILJS_TEMPLATE_ID: string
  readonly VITE_EMAILJS_PUBLIC_KEY: string
  readonly VITE_CUSTOM_DETECTION_ENDPOINT?: string
  readonly VITE_ENABLE_OBJECT_DETECTION?: string
  readonly VITE_MAX_DETECTION_FILES?: string
  readonly VITE_MAX_FILE_SIZE_MB?: string
  readonly VITE_BASE_LABOR_RATE?: string
  readonly VITE_TRUCK_RATE_PER_MILE?: string
  readonly VITE_DEBUG_DETECTION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}