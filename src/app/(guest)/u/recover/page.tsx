"use client"
import { APP_NAME } from '@/config';
import { dynamic } from '@zuzjs/core';
import { Box, Button, css, Form, FORMVALIDATION, Group, Input, Text, TRANSITION_CURVES, TRANSITIONS, Variant } from '@zuzjs/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Recover : React.FC = (_props) => {

    const router = useRouter();

    const onSuccess = (resp: dynamic) => {
        router.push(`/u/recover/verify/${resp.token}/${encodeURIComponent(resp.email)}`)
    }

    useEffect(() => {}, [])

    return <Group 
        as={`h:100vh w:50vw bg:$surface abs abc flex aic jcc p:150 cols gap:15`}>
        <Form 
            name={`recover`}
            action={`/@/u/recover`}
            onSuccess={onSuccess}
            errors={{
                em: `Valid email is required`,
            }}
            as={`flex cols w:320 gap:12`}>
            
            <Text as={`s:20 b:700 mb:10`}>Recover {APP_NAME} Account</Text>

            <Input variant={Variant.Medium} name={`em`} placeholder={`Email`} required with={FORMVALIDATION.Email} />
            
            <Button variant={Variant.Medium} type={`submit`} as={`mt:25 bold`}>Continue</Button>

            <Text as={`mt:35`}>Already have an account? <Link className={css(`tdn bold &hover(tdu)`)} href={`/u/signin`}>Sign in here</Link></Text>
            <Text>New here? <Link className={css(`tdn bold &hover(tdu)`)} href={`/u/signup`}>Create account</Link></Text>

        </Form>
    </Group>
}

export default Recover