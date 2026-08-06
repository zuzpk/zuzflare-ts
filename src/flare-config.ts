import { APP_URL } from "./config";

export const FLARE_APP_ID = "default-2";
export const FLARE_API_KEY = `FA_8agoDtcSv23LbOgrdmQOARjNbeTbrEPZ9iDCo9`;

export const FLARE_SERVER_URL = `https://flare.zuzcdn.net`;
export const FLARE_INTERNAL_SERVER_URL = `https://flare.zuzcdn.net`;

export const FLARE_INTERNAL_USER_TOKEN = process.env.FLARE_INTERNAL_USER_TOKEN?.trim() || null;

export const APP_ORIGIN =
    process.env.NEXT_PUBLIC_APP_ORIGIN
    ?? (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : APP_URL.slice(0, APP_URL.indexOf("/", APP_URL.indexOf("//") + 2)));

// Core HTTP helpers require absolute URLs in SSR/middleware contexts.
// Keep browser usage relative, but make server-side calls absolute.
export const FLARE_HTTP_BASE = typeof window === "undefined"
    ? `${APP_ORIGIN}/@/flare`
    : "/@/flare";
