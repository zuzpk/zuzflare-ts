import { type IDBOptions } from "@zuzjs/hooks"
import packageJson from "../package.json"
import { DB } from "./types"

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

export const LocalDB = {
    App: {
        name: APP_NAME.toLowerCase(),
        version: +APP_VERSION.replace(/\./g, ``),
        meta: [
            {
                name: DB.You,
                config: { keyPath: "uid", autoIncrement: false },
                schema: [
                    { name: "uid", unique: true },
                    { name: "utp" },
                    { name: "name" },
                    { name: "email" },
                    { name: "cc" },
                    { name: "status" },
                ],
            },
            {
                name: DB.Config,
                config: { keyPath: "appId", autoIncrement: false },
                schema: [
                    { name: "appId", unique: true },
                ],
            },
        ]
    } satisfies IDBOptions
}