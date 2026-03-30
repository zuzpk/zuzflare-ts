import { connectApp } from "@zuzjs/flare";
import { APP_URL } from "./config";

export const FLARE_API_KEY = `FA_8agoDtcSv23LbOgrdmQOARjNbeTbrEPZ9iDCo9`;
export const FLARE_SERVER_URL = `http://192.168.100.4:25050` // "https://flare.zuzcdn.net"
export const FLARE_APP_ID = "default-2";

const APP_ORIGIN =
    process.env.NEXT_PUBLIC_APP_ORIGIN
    ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : APP_URL.slice(0, APP_URL.indexOf("/", APP_URL.indexOf("//") + 2)));

// Core HTTP helpers require absolute URLs in SSR/middleware contexts.
// Keep browser usage relative, but make server-side calls absolute.
const FLARE_HTTP_BASE = typeof window === "undefined"
    ? `${APP_ORIGIN}/api/flare`
    : "/api/flare";

export const {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    verifyEmailWithCode,
    confirmEmailLink,
    signOut,
    sendAccountRecovery,
    refreshAuthSession,
    currentUser,
    getCurrentUser,
    onAuthConfigLoaded,
    onAuthStateChanged,
    onConnectionStateChange,
    collection,
    doc
} = connectApp({
    appId: FLARE_APP_ID,
    apiKey: FLARE_API_KEY,
    endpoint: FLARE_SERVER_URL,
    httpBase: FLARE_HTTP_BASE,
    // encrypted: true,
    publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArGEx1to3CSZfvSDhf97E
IZW/hHa0Zs/BEHnuK8L3Zu66PXbKUT8opBhVD7YJ44fO9GGxGHdadb+3tPZ3QRXi
uWZy9APJG5YmlOaavTLAh6V0ehOZcH6+ZSF+cBgdMLok+jp6m5HWQqKvlXCh9bo2
zXBan2WYnn2PbS1/nksCyE3yBLM20FcZJRHGkKz249L1LGx+040T2bsX8ekB6PLU
6jgVadG4j99m44Q9uXsqbXBVpC5rAg4/5vIeytddt2XYTVyP+lPI0NO57oJH4v+t
C8KFrIeYY8uH9clxSXzHSC2kNrphUplLmUsDC194yRHdmKUA13O0HK9bkxi9a1rX
6wIDAQAB
-----END PUBLIC KEY-----`,
    // debug: true
})