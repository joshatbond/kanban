/// <reference types="vinxi/types/server" />
import { createClerkHandler } from '@clerk/tanstack-start/server'
import { getRouterManifest } from '@tanstack/react-start/router-manifest'
import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'

import { createRouter } from './router'

const handler = createStartHandler({
  createRouter,
  getRouterManifest,
})

const clerkHandler = createClerkHandler(handler)

export default clerkHandler(defaultStreamHandler)
