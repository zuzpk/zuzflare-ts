import { flare, onAuthStateChanged } from "@/flare";
import { Store } from "@/store";
import { User } from "@/types";
import { FlareAuthUser } from "@zuzjs/flare";
import { useStore } from "@zuzjs/store";
import { useEffect, useState } from "react";

type SyncUserStoreOptions = {
    includeName?: boolean;
    clearOnSignOut?: boolean;
}

type CurrentUserState = {
    user: FlareAuthUser | null;
    isLoading: boolean;
}

export const useSession = (options?: SyncUserStoreOptions) => {

    const userState = useStore<Pick<User, "id" | "uid" | "email" | "name" | "loading">>(
        Store.User, 
        s => ({ 
            id: s.id, 
            uid: s.uid, 
            email: s.email, 
            name: s.name, 
            loading: 
            s.loading 
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
    }, [authState.isLoading, (authState.user as any)?.id, (authState.user as any)?.uid, authState.user?.email, userState.id, userState.uid, userState.email, userState.name, userState.dispatch, options?.includeName, options?.clearOnSignOut])

    return {
        ...authState.user,
        loading: authState.isLoading,
    }

}

export const useCurrentUser = () => {

    const [currentUser, setCurrentUser] = useState<CurrentUserState>({
        user: null,
        isLoading: true,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(user => {

            if (!flare.isBootstrapAttempted()) {
                return; 
            }
            
            const nextUser = (() => {
                const nextId = (user as any)?.uid ?? (user as any)?.id
                return nextId ? user : null
            })()

            setCurrentUser(prev => {
                const prevId = (prev.user as any)?.uid ?? (prev.user as any)?.id
                const nextId = (nextUser as any)?.uid ?? (nextUser as any)?.id
                const prevName = (prev.user as any)?.name ?? null
                const nextName = (nextUser as any)?.name ?? null
                const prevEmail = (prev.user as any)?.email ?? null
                const nextEmail = (nextUser as any)?.email ?? null

                if (
                    prev.isLoading === false &&
                    prevId === nextId &&
                    prevName === nextName &&
                    prevEmail === nextEmail
                ) return prev

                return {
                    user: nextUser,
                    isLoading: false,
                }
            })
        })

        return () => {
            // console.log(`--unsubscribing from auth changes`)
            if (typeof unsubscribe === "function") unsubscribe()
        }   

    }, [])

    return currentUser;

}