"use client"
import Done from '@/app/done'
import { useStore } from '@zuzjs/store'
import { Box, Button, Cover, css, Form, Group, PinInput, Sheet, SheetHandler, Text, TRANSITION_CURVES, TRANSITIONS, Variant } from '@zuzjs/ui'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { dynamic, withPost } from "@zuzjs/core"
import { useMounted } from '@zuzjs/hooks'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Sent : React.FC = (_props) => {

    const [ token, em ] = useParams().token ?? [ `token`, `em` ]
    const [ resend, setSend ] = useState(false)
    const [ verifying, setVerifying ] = useState(em ? false : true)
    const [ done, setDone ] = useState<number | null>(0)
    const mounted = useMounted()
    const anim = useMemo(() => ({
        transition: TRANSITIONS.SlideInTop,
        curve: TRANSITION_CURVES.Spring,
        when: mounted,
        duration: 0.5
    }), [mounted])
    const toast = useRef<SheetHandler | null>(null)
    const router = useRouter();
    const { dispatch } = useStore(`app`)

    const onSuccess = (resp: dynamic) => {
        setVerifying(false)
        dispatch({ token: resp.token }).then(() => router.push(`/u/recover/update?v=${Date.now()}`))
    }

    const autoVerify = () => {
        withPost<{
            token: string
        }>(
            `/@/u/verify`,
            { token }
        )
        .then(onSuccess)
        .catch(err => {
            setVerifying(false)
            setDone(err.code == 101 ? 101 : null)
            toast.current!.error(err.message || `Failed to verify account`)
        })
    }

    useEffect(() => {
        
        document.title = `Verify Recover Code`

        if ( em ){
            setTimeout(() => setSend(true), 4000)
        }
        else autoVerify()

    }, [])

    return <Group 
        as={`h:100vh w:50vw bg:$surface abs abc flex aic jcc p:150 cols gap:15`}>
        <Cover when={verifying} message={`verfying...`} />
        { done ? done == 101 ? <Done 
            type={`error`}
            title={`Already verified`}
            message={`Your account is already verified. Continue to Login`} />
            : <Done 
            type={`success`}
            title={`Good Job, ${done}`} 
            message={`Your account is verified now. Continue to Login`} />
        : <Form 
            withData={{
                token
            }}
            name={`verify`}
            onSuccess={onSuccess}
            action={`/@/u/verify`}
            errors={{
                otp: `OTP Code is required`,
            }}
            as={`flex cols w:320 gap:12`}>
            
            <Text as={`s:18 mb:10`}>We have sent you a verification code{em ? <> to <b>{decodeURIComponent(em as string)}</b></> : null}</Text>

            <PinInput name={`otp`} as={`s:xl! b:900`} length={6} required />
            
            <Button type={`submit`} as={`mt:25 bold`}>Verify</Button>

            { resend && <Box as={`mt:25 s:16`}>Code not received? <Link href={`/u/recover?resend=1`} className={css(`tdn bold &hover(tdu)`)}>Re-send code</Link></Box> }

        </Form>}
    </Group>
}

export default Sent