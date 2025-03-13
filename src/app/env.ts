import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  client: {
    VITE_CONVEX_URL: z.string(),
  },
  runtimeEnv: import.meta.env,
  skipValidation: import.meta.env.SKIP_ENV_VALIDATION === 'development',
  clientPrefix: 'VITE_',
})
