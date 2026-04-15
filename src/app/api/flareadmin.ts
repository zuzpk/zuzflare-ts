import { FLARE_APP_ID, FLARE_INTERNAL_SERVER_URL } from "@/flare";
import { connectApp } from "@zuzjs/flare-admin";

export const flareAdmin = connectApp({
  serverUrl: FLARE_INTERNAL_SERVER_URL,
  appId:     FLARE_APP_ID,
  adminKey:  process.env.FLARE_INTERNAL_ADMIN_KEY!,
});