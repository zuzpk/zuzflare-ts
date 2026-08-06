import { AppStore, Store } from "@/store";
import { useStore } from "@zuzjs/store";
import { useEffect } from "react";

export const useApp = () => {
    
    const appState = useStore<Pick<typeof AppStore.App, "version" | "theme">>(
        Store.App, 
        s => ({ 
            version: s.version,
            theme: s.theme,
        }),
        (prev, next) => (
            prev.version === next.version &&
            prev.theme === next.theme
        )
    )

    return appState
}

export const usePageTitle = (title: string) => {
    useEffect(() => {
        const originalTitle = document.title
        document.title = title
        return () => {
            document.title = originalTitle
        }

    }, [title])
}