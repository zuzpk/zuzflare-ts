import { AUTH_USER_HEADER } from "@/config";
import { User } from "@/types";
import { AuthConfigResponse } from "@zuzjs/flare";
import { headers } from "next/headers";
import Wrapper from "./wrapper";

const getCurrentUser = async (): Promise<User> => {
  const headerStore = await headers()
  const authUserHeader = headerStore.get(AUTH_USER_HEADER)

  if (!authUserHeader) {
    return {
      loading: false,
      uid: null,
      name: undefined,
      email: undefined,
    }
  }

  try {
    const authUser = JSON.parse(decodeURIComponent(authUserHeader)) as Partial<User>

    return {
      loading: false,
      uid: authUser.uid ?? null,
      name: authUser.name ?? undefined,
      email: authUser.email ?? undefined,
    }
  }
  catch {
    return {
      loading: false,
      uid: null,
      name: undefined,
      email: undefined,
    }
  }
}

const getAuthConfig = async (): Promise<Omit<AuthConfigResponse, `csrfToken`>> => {
  const headerStore = await headers()
  const authConfigHeader = headerStore.get(`x-flare-auth-config`)

  if (!authConfigHeader) {
    return {} as Omit<AuthConfigResponse, `csrfToken`>
  }

  try {

    const authConfig = JSON.parse(decodeURIComponent(authConfigHeader)) as Partial<AuthConfigResponse>
    if ( authConfig.csrfToken ) delete authConfig.csrfToken
    return {
      ...authConfig,
    } as any

  }
  catch {
    return {} as Omit<AuthConfigResponse, `csrfToken`>
  }
}

const RootLayout = async ({ children, }: Readonly<{ children: React.ReactNode; }>) => {
  const currentUser = await getCurrentUser()

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="preconnect" href="https://icons.zuzcdn.net" />
        <link rel="stylesheet" href="https://icons.zuzcdn.net/public/pP52L1YW/style.css" />
      </head>
      <body>
        <Wrapper currentUser={currentUser} authConfig={await getAuthConfig()}>{children}</Wrapper>
      </body>
    </html>
  );
}

export default RootLayout