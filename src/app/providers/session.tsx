import { onAuthStateChanged } from "@/flare";
import { Store } from "@/store";
import { CurrentUserState, SyncUserStoreOptions, User } from "@/types";
import { _, dynamic } from "@zuzjs/core";
import { FlareAuthUser } from "@zuzjs/flare";
import createStore, { useStore } from "@zuzjs/store";
import { useEffect, useState } from "react";

export type UseSessionData<TUser extends Record<string, unknown> = FlareAuthUser> =
    Omit<TUser, "accessToken" | "refreshToken" | "access_token" | "refresh_token"> & {
        dispatch: (payload?: dynamic | undefined) => Promise<void>,
        loading: boolean;
        picture?: string;
        color?: string;
    }

const initialSessionState: UseSessionData<any> = {
    id: null,
    uid: null,
    email: undefined,
    name: undefined,
    funds: { available: 0, total: 0, hold: 0 },
    picture: undefined,
    stack: [],
    loading: true,
    dispatch: () => {}
} as any;

const { Provider } = createStore<UseSessionData<any>>(Store.Session, initialSessionState);


export const useCurrentUser = () => {

    const [currentUser, setCurrentUser] = useState<CurrentUserState>({
        user: null,
        isLoading: true,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(user => {

            const nextUser = (() => {
                const nextId = (user as any)?.uid ?? (user as any)?.id
                return nextId ? user : null
            })()

            setCurrentUser(prev => {

                if (prev.isLoading === false && !prev.user && !nextUser) {
                    return prev;
                }

                if (
                    prev.isLoading === false && 
                    _(prev.user).equals(nextUser)
                ) {
                    return prev;
                }

                return {
                    user: nextUser,
                    isLoading: false,
                }
            })

            
        })

        return () => {
            unsubscribe?.()
        }   

    }, [])

    return currentUser;

}

export const useSessionStore = <TUser extends Record<string, unknown> = FlareAuthUser>(): UseSessionData<TUser> => {
    return useStore(Store.Session);
};

export const useSession = <TUser extends Record<string, unknown> = FlareAuthUser>(): UseSessionData<TUser> => {
    const { dispatch, ...store } = useStore(Store.Session);
    return store as UseSessionData<TUser>;
};

export const useSessionHook = ( options?: SyncUserStoreOptions ) => {

    const userState = useStore<Pick<User, "id" | "uid" | "email" | "name" | "loading">>(
        Store.User, 
        s => ({ 
            id: s.id, 
            uid: s.uid, 
            email: s.email, 
            name: s.name, 
            loading: s.loading,
            funds: s.funds
        }),
        (prev, next) => (
            prev.id == next.id &&
            prev.uid === next.uid &&
            prev.email === next.email &&
            prev.name === next.name &&
            prev.loading === next.loading
        )
    )

    const authState = useCurrentUser()
    const { dispatch } = useStore(Store.Session);

    useEffect(() => {
        if ( authState.isLoading ) return

        const authUserId = (authState.user as any)?.id ?? (authState.user as any)?.uid ?? null

        if ( authUserId ){
            const authEmail = authState.user?.email
            const payload: Partial<User> = {
                id: authUserId,
                uid: authUserId,
                email: authEmail ?? userState.email,
            }

            if ( options?.includeName ){
                const nextName = (authState.user as any)?.name
                if ( typeof nextName === "string" && nextName.trim().length > 0 ) payload.name = nextName
            }

            userState.dispatch(payload)
            return
        }

        if ( options?.clearOnSignOut === true && (userState.id || userState.uid) ){
            userState.dispatch({
                id: null,
                uid: null,
                email: undefined,
                name: options?.includeName ? null : userState.name,
                loading: false,
            })
        }
    }, [
        authState.isLoading, 
        (authState.user as any)?.id, 
        authState.user?.email, 
        userState.id, 
        userState.uid, 
        userState.email, 
        userState.name, 
        userState.dispatch, 
        options?.includeName, 
        options?.clearOnSignOut
    ])

    const { 
        accessToken: _a, 
        refreshToken: _r, 
        access_token: _a2, 
        refresh_token: _r2, 
        avatar_url, 
        ...safeUser 
    } =
        ((authState.user ?? {}) as any);

    const isSignedOut = authState.isLoading === false && !authState.user
    const shouldClearSession = options?.clearOnSignOut === true && isSignedOut

    const _safeUser = safeUser as any

    const safeUserWithFallback = {
        ...safeUser,
        id: shouldClearSession ? null : (_safeUser?.id ?? _safeUser?.uid ?? userState.id ?? userState.uid ?? null),
        uid: shouldClearSession ? null : (_safeUser?.uid ?? _safeUser?.id ?? userState.uid ?? userState.id ?? null),
        email: shouldClearSession ? undefined : (_safeUser?.email ?? userState.email),
        name: shouldClearSession ? (options?.includeName ? null : undefined) : (_safeUser?.name ?? userState.name),
        picture: avatar_url ?? safeUser.picture ?? undefined
    }

    useEffect(() => {
        dispatch({
            ...safeUserWithFallback,
            loading: authState.isLoading,
            dispatch: userState.dispatch,
        });
    }, [
        authState.isLoading, 
        shouldClearSession,
        userState.id, 
        userState.uid, 
        userState.email, 
        userState.name, 
        avatar_url,
        safeUser.picture
    ]);

}

export const SessionProviderWrapper: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    return (
        <Provider>
            {children}
        </Provider>
    );
};

export const SessionProvider: React.FC<{
    options?: SyncUserStoreOptions;
    children: React.ReactNode;
}> = ({ options, children }) => {
    useSessionHook(options);
    return children
};