import { REDIRECT_AFTER_OAUTH } from "./config";

export const routes = {
    private: [
        REDIRECT_AFTER_OAUTH
    ],
    public: [
        `/u`
    ],
    shared: []
}

// Check if pathname equals route OR starts with route + "/"
const checkPath = (routesArray: string[], pathname: string) => {
    return routesArray.some(path => {
        // Exact match
        if (pathname === path) return true;
        // Starts with path + "/" (e.g., /a/ matches /a/app-id)
        if (pathname.startsWith(path) && pathname.length > path.length) return true;
        return false;
    });
};

export const withRoutes = (pathname: string) => ({
    isPrivate: checkPath(routes.private, pathname),
    isPublic: checkPath(routes.public, pathname),
    isShared: checkPath(routes.shared, pathname)
})