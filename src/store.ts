import { FlareAuthUser, type AuthConfigResponse } from "@zuzjs/flare";
import { APP_VERSION } from "./config";

export enum Store {
    App = "app",
    User = "user",
    Apps = "apps"
}

export const AppStore = {
    App : {
        version: APP_VERSION,
        debug: true,
        token: null,
        theme: `system`,
        violations: [] as string[],
        authConfig: {} as Omit<AuthConfigResponse, 'csrfToken'>,
    },
    User : {
        loading: true,
    } as {
        loading: boolean;
    } & FlareAuthUser
}