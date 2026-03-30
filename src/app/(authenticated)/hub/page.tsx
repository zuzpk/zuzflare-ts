"use client"
import { Store } from '@/store';
import { User } from '@/types';
import { useStore } from '@zuzjs/store';
import { Flex, Text } from '@zuzjs/ui';
import React from 'react';

const Page : React.FC = (_props) => {

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

    return <Flex aic jcc cols as={`w:100vw h:80vh`}>
       <Text as={`s:xl`}>Welcome {me.name}</Text>
       <Text as={`s:md`}>we were expection you, good job</Text>
    </Flex>
}

export default Page;