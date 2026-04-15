"use client"
import { sendAccountRecovery } from '@/flare';
import { dynamic } from '@zuzjs/core';
import { FlareResponseCodes } from '@zuzjs/flare';
import { Button, css, Form, FormHandler, FORMVALIDATION, Group, Input, Text, useSnack, useToast, Variant } from '@zuzjs/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Recover : React.FC = (_props) => {

    const router = useRouter();
    const form = useRef<FormHandler>(null)
    const toast = useToast()
    const snack = useSnack()
    
    const onSuccess = (resp: dynamic) => {
        router.push(`/u/recover/verify/${resp.token}/${encodeURIComponent(resp.email)}`)
    }

    const onSubmit = async (data : dynamic) => {

        form.current?.setLoading(true);
        snack.clearAll()

        sendAccountRecovery(data.em)
            .then(resp => {

                if ( resp.kind === FlareResponseCodes.verificationDispatch ){

                    router.push(`/u/recover/verify/${encodeURIComponent(data.em)}`)
                }
                
            })
            .catch(err => {

                toast.error(err.message || `Recovery email dispatch failed`)

            })
            .finally(() => {
                form.current?.setLoading(false)
            })
    }

    useEffect(() => {
        document.title = `Recover Account`
    }, [])

    return <Group 
        as={`abs abc flex aic jcc cols gap:15`}>
        <Form 
            ref={form}
            name={`recover`}
            onSuccess={onSuccess}
            onSubmit={onSubmit}
            errors={{
                em: `Valid email is required`,
            }}
            as={`flex cols w:320 gap:12`}>
            
            <Text as={`s:20 b:700 mb:10`}>Forgot Password?</Text>

            <Input variant={Variant.Medium} name={`em`} placeholder={`Email`} required with={FORMVALIDATION.Email} />
            
            <Button variant={Variant.Medium} type={`submit`} as={`mt:25 bold`}>Continue</Button>

            <Text as={`mt:35`}>Already have an account? <Link className={css(`tdn bold &hover(tdu)`)} href={`/u/signin`}>Sign in here</Link></Text>
            <Text>New here? <Link className={css(`tdn bold &hover(tdu)`)} href={`/u/signup`}>Create account</Link></Text>

        </Form>
    </Group>
}

export default Recover