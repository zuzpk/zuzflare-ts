import { FLARE_API_KEY, FLARE_APP_ID, FLARE_HTTP_BASE, FLARE_SERVER_URL } from "@/flare-config";
import { User } from "@/types";
import { connectApp } from "@zuzjs/flare";

export enum Collections {
    Users = "users"
}

export const flare = connectApp({
    appId: FLARE_APP_ID,
    apiKey: FLARE_API_KEY,
    endpoint: FLARE_SERVER_URL,
    httpBase: FLARE_HTTP_BASE,
    authBootstrapMode: "none",
    pushNotifications: true,
    dataMapper: {
        [Collections.Users]: (u: any) : User => ({
            loading: false,
            id: u.uid,
            name: u.authMeta?.additionalParams?.name ?? `#${u.uid}`,
            picture: u.authMeta?.additionalParams?.picture ?? `https://i.pravatar.cc/150?u=${u.uid}`,
            email: u.email,
            emailVerified: u.emailVerified
        }),
    }
})

export const {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    verifyEmailWithCode,
    confirmEmailLink,
    sendAccountRecovery,
    recoverAccountWithCode,
    recoverAccountWithToken,
    signOut,
    refreshAuthSession,
    hydrateAuthState,
    getCurrentUser,
    onAuthConfigLoaded,
    onAuthStateChanged,
    onConnectionStateChange,
    collection,
    doc
} = flare;

export let currentUser = flare.getCurrentUser();

flare.onAuthStateChanged(user => currentUser = user ?? undefined)