"use client"
import { FB_PIXEL_ID, GA_MEASUREMENT_ID } from "@/config";
import { AppStore, Store } from "@/store";
import { AuthConfigResponse } from "@zuzjs/flare";
import { useFacebookPixel, useGoogleTagManager } from "@zuzjs/hooks";
import createStore from "@zuzjs/store";
import { ReactNode, useEffect } from "react";
import { SessionProvider } from "../providers/session";

const Wrapper = ({ 
    children, 
    authConfig
} : Readonly<{ 
    children: ReactNode; 
    authConfig: Omit<AuthConfigResponse, `csrfToken`>
}>) => {

    const { Provider } = createStore(Store.App, { ...AppStore.App, authConfig })
    const { Provider: UserProvider } = createStore(Store.User, {
        loading: false,
        uid: null,
        id: null
    })
    
    const { trackPageView: sendGTPageView } = useGoogleTagManager(GA_MEASUREMENT_ID!)
    const { trackPageView: sendFBPageView } = useFacebookPixel(FB_PIXEL_ID!)

    useEffect(() => {
        sendGTPageView()
        sendFBPageView()
    }, []);

    return <Provider>
        <Main authConfig={authConfig}>{children}</Main>
    </Provider>    

}

const Main = ({ children, authConfig } : { children: ReactNode; authConfig: Omit<AuthConfigResponse, `csrfToken`> }) => {

    return <SessionProvider options={{
                clearOnSignOut: true
            }}>
            {children}
        </SessionProvider>
}

export default Wrapper