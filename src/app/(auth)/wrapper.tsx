"use client"
// import "@/app/css/app.scss";
import { FB_PIXEL_ID, GA_MEASUREMENT_ID } from "@/config";
import { hydrateAuthState } from "@/flare";
import { Store } from "@/store";
import { User } from "@/types";
import { AuthConfigResponse } from "@zuzjs/flare";
import { useFacebookPixel, useGoogleTagManager } from "@zuzjs/hooks";
import createStore from "@zuzjs/store";
import { ReactNode, useEffect } from "react";
import { SessionProvider } from "../providers/session";

const AuthWrapper = ({ children, currentUser, authConfig } : Readonly<{ 
    children: ReactNode; 
    currentUser: User,
    authConfig: Omit<AuthConfigResponse, `csrfToken`>
}>) => {

    const { provider, ...restCurrentUser } = currentUser
    const normalizedUserState = {
        ...restCurrentUser,
        uid: restCurrentUser.uid ?? restCurrentUser.id ?? null,
        id: restCurrentUser.id ?? restCurrentUser.uid ?? null,
    }

    const { Provider: UserProvider } = createStore(Store.User, normalizedUserState)
    
    const { trackPageView: sendGTPageView } = useGoogleTagManager(GA_MEASUREMENT_ID!)
    const { trackPageView: sendFBPageView } = useFacebookPixel(FB_PIXEL_ID!)

    useEffect(() => {
        sendGTPageView()
        sendFBPageView()
    }, []);

    useEffect(() => {

        const uid = normalizedUserState.uid ?? normalizedUserState.id ?? null

        if (!uid) {
            hydrateAuthState(null, {
                source: "wrapper.initial",
                markBootstrapAttempted: true,
                syncSocket: true,
            }).catch(() => undefined)
            return
        }

        hydrateAuthState(currentUser, {
            source: "wrapper.initial",
            markBootstrapAttempted: true,
            syncSocket: true,
        }).catch(() => undefined)
    }, [normalizedUserState.uid, normalizedUserState.id, normalizedUserState.email, normalizedUserState.emailVerified, normalizedUserState.name, normalizedUserState.picture, normalizedUserState.color])


    return <SessionProvider options={{ clearOnSignOut: true }}>
        <Main currentUser={currentUser} authConfig={authConfig}>{children}</Main>
    </SessionProvider>
    

}

const Main = ({ children, currentUser, authConfig } : { children: ReactNode; currentUser: User; authConfig: Omit<AuthConfigResponse, `csrfToken`> }) => {

    return children
}

export default AuthWrapper