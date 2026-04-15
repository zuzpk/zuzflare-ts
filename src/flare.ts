import { connectApp } from "@zuzjs/flare";
import { APP_URL } from "./config";
import { User } from "./types";

export const FLARE_API_KEY = `FA_8agoDtcSv23LbOgrdmQOARjNbeTbrEPZ9iDCo9`;
export const FLARE_SERVER_URL = `http://192.168.100.4:25050` // "https://flare.zuzcdn.net"
export const FLARE_APP_ID = "default-2";

export const FLARE_INTERNAL_SERVER_URL = `http://192.168.100.4:25050`;
export const FLARE_INTERNAL_USER_TOKEN = process.env.FLARE_INTERNAL_USER_TOKEN?.trim() || null;

const APP_ORIGIN =
    process.env.NEXT_PUBLIC_APP_ORIGIN
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : APP_URL.slice(0, APP_URL.indexOf("/", APP_URL.indexOf("//") + 2)));

// Core HTTP helpers require absolute URLs in SSR/middleware contexts.
// Keep browser usage relative, but make server-side calls absolute.
const FLARE_HTTP_BASE = typeof window === "undefined"
    ? `${APP_ORIGIN}/api/flare`
    : "/api/flare";

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