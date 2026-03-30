/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { APP_NAME } from "@/config"
import { getCurrentUser, onAuthStateChanged, signOut } from "@/flare"
import { Store } from "@/store"
import { User } from "@/types"
import { useDelayed } from "@zuzjs/hooks"
import { useStore } from "@zuzjs/store"
import { AVATAR, Avatar, Box, Button, ColorScheme, css, Flex, Icon, ORIGIN, SheetHandler, Spinner, Text, useContextMenu } from "@zuzjs/ui"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

const Header = () => {

    const me = useStore<Pick<User, "uid" | "email" | "name" | "loading">>(
        Store.User, 
        s => ({ uid: s.uid, email: s.email, name: s.name, loading: s.loading }),
        (prev, next) => (
            prev.uid === next.uid &&
            prev.email === next.email &&
            prev.name === next.name &&
            prev.loading === next.loading
        )
    )
    const toast = useRef<SheetHandler>(null)
    const mounted = useDelayed()
    const pathname = usePathname()
    const router = useRouter()
    // const userMenu = useRef<ContextMenuHandler>(null)
    const userMenuParent = useRef<HTMLButtonElement>(null)
    const { showMenu } = useContextMenu();
    // const { remove } = useDB(LocalDB.You)

    const _signOut = () => {

        me.dispatch({ loading: true });
        signOut()
            .then(() => {
                router.push(`/?_=${Date.now()}`)
                me.dispatch({ loading: false, uid: null, email: undefined })
            })
            .catch(() => {
                me.dispatch({ loading: false })
            })
        
    }

    const showUserMenu = (ev: React.MouseEvent) => {
        showMenu(userMenuParent, {
            items: [
                { label: `Signout`, onSelect: async () => {
                    setTimeout(_signOut, 500)
                } }
            ],
            origin: ORIGIN.TopRight
        })
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged((user: any) => {
            console.log(`Auth state changed`, getCurrentUser())
            if (
                (me.uid && user) || 
                (!me.uid && user)
            ){
                me.dispatch({ 
                    uid: user?.uid ?? null, 
                    email: user?.email ?? null,
                    // name: user?.name ?? null,
                })
            }
        })

        return () => {
            if (typeof unsubscribe === "function") unsubscribe()
        }
    }, [me.name, me.dispatch])


    return <Box as={[
        `header flex aic p:40,25 rel zIndex:99 &ph(p:20) h:70`,
    ]}>
        <Box as={`logo flex aic flex:1`}>
            <Link href={`/` as any} className={css(`tdn`)}><Flex aic as={`app-logo rel -fx`} gap={10}>
                {/* <Image src="/imgs/flare-logo.svg" alt={APP_NAME} as={`w:75`} /> */}
                <Icon name={`ship`} as={`s:lg c:$primary opacity:0.5`} />
                <Text as={`s:lg bold`} tfx={`fog`}>{APP_NAME}</Text>
                {/* <Text tfx={`fog`} as={`s:14 opacity:0.5`}>v{APP_VERSION}</Text> */}
            </Flex></Link>
        </Box> 

        <Flex aic jce>

            { me.loading ? <Spinner /> : 
                me.uid ? <>
                    <Box as={`flex aic gap:10`}>
                        <Button 
                            ref={userMenuParent}
                            onClick={(ev) => showUserMenu(ev as any)} as={`bg:transparent! c:$text flex aic gap:6`}>
                            <Avatar alt={me.name ?? `Z`} type={AVATAR.Square} />
                            <Icon name={`arrow-down`} as={`c:$text s:10`} />
                        </Button>
                    </Box>
                    {/* <ContextMenu
                    items={[
                        { label: `Signout`, onSelect: signOut }
                    ]}
                    ref={userMenu} 
                    offsetY={10}
                    offsetX={20}
                    parent={userMenuParent.current!} /> */}
                </>
            : <>
                
            <Link href={{ pathname: "/u/signin" }} className={css(`mr:20 flex aic gap:6 bg:$primary tdn p:6,10 r:$radius-xl c:$text-btn bold`)}>
                <Icon name={`frame`} />
                Sign in</Link>
            </>}
            <ColorScheme />

        </Flex>
    </Box>

}

export default Header