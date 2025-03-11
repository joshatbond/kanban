import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth,
} from '@clerk/tanstack-start'
import { getAuth } from '@clerk/tanstack-start/server'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient } from '@tanstack/react-query'
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import * as React from 'react'
import { Toaster } from 'react-hot-toast'
import { getWebRequest } from 'vinxi/http'
import { DefaultCatchBoundary } from '~/app/components/DefaultCatchBoundary.js'
import { Loader } from '~/app/components/Loader'
import { NotFound } from '~/app/components/NotFound.js'
import appCss from '~/app/styles/app.css?url'

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const auth = await getAuth(getWebRequest())
  const token = await auth.getToken({ template: 'convex' })

  return {
    userId: auth.userId,
    token,
  }
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
  convexClient: ConvexReactClient
  convexQueryClient: ConvexQueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  beforeLoad: async ctx => {
    const auth = await fetchClerkAuth()
    const { userId, token } = auth

    // During SSR only (the only time serverHttpClient exists),
    // set the Clerk auth token to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token)
    }

    return {
      userId,
      token,
    }
  },
  errorComponent: props => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  const context = useRouteContext({ from: Route.id })
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={context.convexClient} useAuth={useAuth}>
        <RootDocument>
          <Outlet />
        </RootDocument>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

function RootDocument(props: React.PropsWithChildren) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>

      <body>
        <div className="flex h-screen min-h-0 flex-col">
          <div className="box-border flex items-center justify-between border-b border-slate-800 bg-slate-900 px-8 py-4">
            <div className="flex items-end gap-4">
              <Link to="/" className="block leading-tight">
                <span className="text-2xl font-black text-white">Trellaux</span>
              </Link>

              <Link
                to="/posts"
                className="text-neutral-400 hover:text-neutral-100"
                activeProps={{
                  className: 'font-bold text-white',
                }}
              >
                Posts
              </Link>

              <LoadingIndicator />
            </div>

            <div>
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal" />
              </SignedOut>
            </div>
          </div>

          <div className="flex h-full min-h-0 flex-grow flex-col">
            {props.children}

            <Toaster />
          </div>
        </div>

        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}

function LoadingIndicator() {
  const isLoading = useRouterState({ select: s => s.isLoading })

  return (
    <div
      className={`h-12 transition-all duration-300 ${
        isLoading ? `opacity-100 delay-300` : `opacity-0 delay-0`
      }`}
    >
      <Loader />
    </div>
  )
}
