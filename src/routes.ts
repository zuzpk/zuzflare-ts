import { REDIRECT_AFTER_OAUTH } from "./config";

export const routes = {
    private: [
        REDIRECT_AFTER_OAUTH
    ],
    public: [
        `/u`
    ],
    shared: [
        `/any`
    ]
}

const checkPath = (routesArray: string[], pathname: string) => routesArray.some(path => pathname == path || pathname.startsWith(path + "/"));

export const withRoutes = (pathname: string) => ({
    isPrivate: checkPath(routes.private, pathname),
    isPublic: checkPath(routes.public, pathname),
    isShared: checkPath(routes.shared, pathname)
})