import packageJson from "../package.json";

export const APP_NAME = "ZuzFlare"
export const APP_TAGLINE = "Self-hosted real-time database cloud"
export const APP_DESCRIPTION = "Official JavaScript/TypeScript client for ZuzFlare Server - Self-hosted real-time database"
export const APP_URL = "http://localhost:3000/"
export const APP_VERSION = packageJson.version
export const GA_MEASUREMENT_ID : string | null = null;
export const FB_PIXEL_ID : string | null = null;

export const SESS_NAME : string = `${APP_NAME.toLowerCase()}.sid`
export const AUTH_USER_HEADER : string = `x-auth-user`

export const ADMIN_EMAIL = `hello@zuz.com.pk`;

export const REDIRECT_AFTER_OAUTH = `/hub`;