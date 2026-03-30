"use client"
import Done from '@/app/done';
import { dynamic } from '@zuzjs/core';
import { useMounted } from '@zuzjs/hooks';
import { useStore } from '@zuzjs/store';
import { Box, Button, Form, FORMVALIDATION, Group, Password, Text, TRANSITION_CURVES, TRANSITIONS, Variant } from '@zuzjs/ui';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Update : React.FC = (_props) => {

    const mounted = useMounted()
    const anim = useMemo(() => ({
        transition: TRANSITIONS.SlideInTop,
        curve: TRANSITION_CURVES.Spring,
        when: mounted,
        duration: 0.5
    }), [mounted])
    const { token } = useStore<dynamic>(`app`)
    const router = useRouter();
    const [ done, setDone ] = useState(null)

    const onSuccess = (resp: dynamic) => {
        setDone(resp.name)
    }

    useEffect(() => {
        if ( !token ){
            router.push(`/u/recover?resend=2`)
        }
    }, [])

    return <Group 
        as={`h:100vh w:50vw bg:$surface abs abc flex aic jcc p:150 cols gap:15`}>
        { done ? <Done
            type={`success`}
            title={`Good Job, ${done}`} 
            message={`Your password is updated. Go Sign in`} /> 
        : <Form 
            name={`recoverupdate`}
            action={`/@/u/recover-update`}
            onSuccess={onSuccess}
            errors={{
                passw: `New Password is required`,
                repassw: `Passwords do not match`
            }}
            withData={{ token }}
            as={`flex cols w:320 gap:12`}>
            
            <Text as={`s:20 b:700 mb:10`}>New Password</Text>

            <Password variant={Variant.Medium} name={`passw`} placeholder={`New Password`} required />
            <Password variant={Variant.Medium} name={`repassw`} placeholder={`Repeat Password`} required with={`${FORMVALIDATION.MatchField}@passw` } />

            <Button variant={Variant.Medium} type={`submit`} as={`mt:25 bold`}>Continue</Button>

        </Form>}
    </Group>
}

export default Update