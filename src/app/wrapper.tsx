"use client"
import "@/app/css/app.scss";
import { FB_PIXEL_ID, GA_MEASUREMENT_ID, LocalDB } from "@/config";
import { hydrateAuthState } from "@/flare";
import { AppStore, Store } from "@/store";
import { DB, User } from "@/types";
import { AuthConfigResponse } from "@zuzjs/flare";
import { DatabaseProvider, useDB, useFacebookPixel, useGoogleTagManager } from "@zuzjs/hooks";
import createStore from "@zuzjs/store";
import { Box, setZuzMap, SPINNER, ThemeProvider, TRANSITION_CURVES, TRANSITIONS, Variant } from "@zuzjs/ui";
import { ReactNode, useEffect } from "react";
import { zuzMap } from "./css/zuzmap";
import Header from "./header";
import PushNotifications from "./webpush";

setZuzMap(zuzMap)

const Wrapper = ({ children, currentUser, authConfig } : Readonly<{ 
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

    const { Provider } = createStore(Store.App, { ...AppStore.App, authConfig })
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


    return <DatabaseProvider options={LocalDB.App}><Provider>
        <UserProvider>
            <Main currentUser={currentUser} authConfig={authConfig}>{children}</Main>
        </UserProvider>
    </Provider>
    </DatabaseProvider>
    

}

const Main = ({ children, currentUser, authConfig } : { children: ReactNode; currentUser: User; authConfig: Omit<AuthConfigResponse, `csrfToken`> }) => {

    const { getByID, update, insert } = useDB(LocalDB.App)

    useEffect(() => {
        if ( authConfig.appId ){
            getByID(DB.Config, authConfig.appId)
            .then(() => {
                update(DB.Config, { ...authConfig })
                    .catch(ue => {
                        console.error(`Failed to update config in local DB`, ue)
                    })
            })
            .catch((_err) => {
                insert(DB.Config, { ...authConfig })
                    .catch(ie => {
                        console.error(`Failed to insert config in local DB`, ie)
                    })
            })
        }
        if ( !currentUser.loading && currentUser.uid ){
            getByID<User>(DB.You, currentUser.uid)
            .then(() => {
                update(DB.You, currentUser)
                    .catch(ue => {
                        console.error(`Failed to update user in local DB`, ue)
                    })
            })
            .catch((_err) => {
                insert(DB.You, currentUser)
                    .catch(ie => {
                        console.error(`Failed to insert user in local DB`, ie)
                    })
            })
        }
    }, [])
    

    return <ThemeProvider
      zuzMap={zuzMap}
      variant={Variant.Medium}
      group={{
        fx: {
          transition: TRANSITIONS.SlideInBottom,
          curve: TRANSITION_CURVES.Liquid
        },
        fxStep: 0.1,
        fxDelay: 0.1
      }}
      spinner={{
        type: SPINNER.Roller
      }}
      toast={{
        curve: TRANSITION_CURVES.Liquid
      }}
      drawer={{
        margin: 20,
        speed: .3
      }}
      dialog={{
        transition: TRANSITIONS.SlideInBottom,
        curve: TRANSITION_CURVES.Liquid,
        speed: 0.5
      }}>
        <Box as={`app flex minH:100vh cols`}>
            <PushNotifications />
            <Header />
            {children}
        </Box>
    </ThemeProvider>

}

export default Wrapper