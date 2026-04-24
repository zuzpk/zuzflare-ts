import { AuthConfigResponse, extractCsrfFromRequest } from '@zuzjs/flare';
import { NextRequest, NextResponse } from 'next/server';
import { getCookies, requireUser } from './app/api/auth';
import { flareAdmin } from './app/api/flareadmin';
import { AUTH_USER_HEADER, REDIRECT_AFTER_OAUTH, SESS_NAME } from './config';
import { FLARE_APP_ID } from './flare';
import { withRoutes } from './routes';

export const getBaseOrigin = (req: NextRequest) => {

    const hostname = req.nextUrl.hostname;

    // Check for localhost
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';

    // Check for Private Network IP ranges (10.x, 172.16-31.x, 192.168.x)
    const isPrivateIP = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);

    // Final URL construction
    return (isLocalhost || isPrivateIP) 
        ? `http://${req.nextUrl.host}` 
        : req.nextUrl.origin;
}


/**
 * Next.js Middleware – SSR CSRF Protection
 * ────────────────────────────────────────
 * 
 * CSRF Token Lifecycle (Server-Side Only):
 * 1. First request: Middleware detects missing CSRF cookie
 * 2. Middleware internally calls /api/flare/csrf route (bootstrap)
 * 3. Route fetches /auth/config from Flare, extracts CSRF from response header
 * 4. Route returns CSRF token in JSON + sets as HttpOnly cookie
 * 5. Middleware sets CSRF token as HttpOnly cookie on response
 * 6. Browser receives CSRF cookie (HttpOnly, read-only by server)
 * 7. On subsequent requests, browser automatically includes CSRF cookie (same-domain)
 * 
 * How Methods Get CSRF:
 * ────────────────────
 * - Browser requests include the HttpOnly CSRF cookie (sent automatically)
 * - Methods call getCsrfHeaders(), which:
 *   * Tries to read CSRF from cookies.document.cookie (fails for HttpOnly)
 *   * Returns {} if unavailable (CSRF is in the cookie, not the header)
 * - Flare server validates request using the CSRF cookie, not header
 * - If no cookie, request fails with 403 CSRF error
 * 
 * Browser vs Server-Side Usage:
 * ────────────────────────────
 * For browser-only FlareClient (non-SSR):
 *   - Explicitly call client.ensureCsrfProtection() once before mutations
 *   - Browser will read CSRF token from x-flare-csrf response header
 *   - For server-side usage, middleware handles everything automatically
 */

export async function proxy(req: NextRequest) {
    
    const pathname = req.nextUrl.pathname;

    const { isPrivate, isPublic, isShared } = withRoutes(pathname);
    // console.log(`Proxying request for`, pathname, { isPrivate, isPublic, isShared })

    let csrf = extractCsrfFromRequest(req, FLARE_APP_ID);
    let csrfBootstrapSetCookie: string | null = null;
    let authConfig : AuthConfigResponse | undefined = undefined;

    // Bootstrap SSR CSRF cookie in-band to avoid redirect loops.
    if (!csrf) {
        const bootstrapUrl = new URL(
            '/api/flare/csrf', 
            getBaseOrigin(req)
        );
        
        const bootstrap = await fetch(bootstrapUrl.toString(), {
            method: 'GET',
            cache: 'no-store',
            headers: {
                cookie: req.headers.get('cookie') ?? '',
            },
        }).catch(() => null);

        if (bootstrap) {
            csrfBootstrapSetCookie = bootstrap.headers.get('set-cookie');
            authConfig = await bootstrap.json().catch(() => ({} as any));
            if (!csrf && typeof authConfig?.csrfToken === 'string' && authConfig.csrfToken.length > 0) {
                csrf = authConfig.csrfToken;
            }
        }

    }

    // console.log(`Proxying request for`, pathname, { csrf, csrfBootstrapSetCookie, authConfig })

    const oauth = await requireUser(req)

    // console.log(`OAuth check for ${pathname}:`, { oauth, isPrivate, isPublic, isShared })

    if ( 
        (!oauth || oauth.hasSession === false) && 
        isPrivate
    ){
        return NextResponse.redirect(new URL(`/u/signin?_nxt=${pathname}`, req.url))
    }

    const requestHeaders = new Headers(req.headers)
    if (csrf) {
        requestHeaders.set('x-flare-csrf', csrf)
    }

    if ( authConfig ){
        requestHeaders.set(`x-flare-auth-config`, encodeURIComponent(JSON.stringify(authConfig)))
    }

    let response: NextResponse = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if ( authConfig && authConfig.cookie ){
        response.cookies.set(SESS_NAME, JSON.stringify(authConfig.cookie), {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 365,
            secure: req.nextUrl.protocol === 'https:',
        })
    }

    if ( 
        oauth.hasSession === true &&
        (pathname == `/` || (isPublic && !isShared))
    ){
        response = NextResponse.redirect(new URL(`${REDIRECT_AFTER_OAUTH}?_=${Date.now()}`, req.url))
    }


    if (oauth.hasSession === true) {
        
        const socketTicket = await flareAdmin.auth().getTicket(oauth.user?.session.uid!, {
            tag: `wss`
        }).catch(() => null);
        
        requestHeaders.set(AUTH_USER_HEADER, encodeURIComponent(JSON.stringify({
            loading: false,
            uid: oauth.user?.session.uid ?? null,
            id: oauth.user?.session.uid ?? null,
            email: oauth.user?.session.email ?? undefined,
            emailVerified: oauth.user?.session.emailVerified ?? undefined,
            provider: oauth.user?.session.provider ?? undefined,
            ticket: socketTicket?.ticket ?? `ws:none`,
        })))

        // Preserve redirect responses; only replace response when current response is pass-through.
        if (!response.headers.get('location')) {
            response = NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            })
            if ( oauth.user?.refreshed ) response.headers.append('set-cookie', oauth.user.refreshed)
        }
    }

    if (csrfBootstrapSetCookie) {
        response.headers.append('set-cookie', csrfBootstrapSetCookie)
    }

    if (csrf && !extractCsrfFromRequest(req, FLARE_APP_ID)) {
        response.cookies.set((await getCookies(req)).csrfTokenName, csrf, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60,
            secure: req.nextUrl.protocol === 'https:',
        })
    }

    return response

}


export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|zauth|wss|ws|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    ]
};