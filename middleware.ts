import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/discover',
  '/products',
  '/solutions',
  '/peer-stories',
  '/knowledge-hub',
  '/company',
  '/book-a-demo',
  '/sign-in',
  '/sign-up',
  '/auth',
  '/api/webhooks/clerk',
  '/api/webhooks/clickpesa',
]

export default async function middleware(request: NextRequest) {
  // First, refresh the session and get the user
  const { response, user } = await updateSession(request)
  
  // Check if we are on a public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  )

  if (isPublicRoute) {
    return response
  }

  // Check authentication for private routes
  try {
    if (!user) {
      // Not authenticated, redirect to sign-in
      const url = request.nextUrl.clone()
      url.pathname = '/sign-in'
      url.searchParams.set('redirectED', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error('Middleware auth check error:', error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
