"use client"
import { useSession, useSessionStore } from '@/app/providers/session';
import { signOut } from '@/flare';
import { Button, Flex, Text } from '@zuzjs/ui';
import { useRouter } from 'next/navigation';
import React from 'react';

const Page : React.FC = (_props) => {

    const me = useSession()
    const sessionStore = useSessionStore()
    const router = useRouter()

    const _signOut = () => {

        sessionStore.dispatch?.({ loading: true });
        signOut()
            .then(() => {
                router.push(`/?_=${Date.now()}`)
                sessionStore.dispatch?.({ loading: false, id: null, uid: null, email: undefined })
            })
            .catch(() => {
                sessionStore.dispatch?.({ loading: false })
            })
        
    }

    return <Flex aic jcc cols as={`w:100vw h:80vh`}>
       <Text as={`s:xl`}>Welcome {me.name}</Text>
       <Text as={`s:md`}>we were expection you, good job</Text>
       <Button onClick={_signOut} as={`mt:20`}>Signout</Button>
    </Flex>
}

export default Page;