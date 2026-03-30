"use client"
import Done from '@/app/done'
import { confirmEmailLink, verifyEmailWithCode } from '@/flare'
import { _, dynamic } from "@zuzjs/core"
import { FlareErrors } from '@zuzjs/flare'
import { Box, Button, Cover, css, Form, Group, PinInput, Text, useSnack } from '@zuzjs/ui'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Verify : React.FC = (_props) => {

    const router = useRouter()
    const [ token, em ] = useParams().verification ?? [ `token`, `em` ]
    const [ resend, setSend ] = useState(false)
    const [ verifying, setVerifying ] = useState(true)
    const [ result, setResult ] = useState<{
        type: `success` | `error`;
        code: string;
        title: string;
        message: string;
    } | null>(null)
    const snack = useSnack()
    const verifyingRef = useRef(false)

    const onSuccess = (resp : dynamic) => {
        setVerifying(false)
        setResult({
            code: `verified`,
            type: `success`,
            title: `Good Job, ${resp.name ?? `That was easy :)`}`,
            message: `Your account is verified now. Continue to Login`
        })
    }

    const autoVerify = async () => {
        
        if ( verifyingRef.current ) return
        verifyingRef.current = true

        setVerifying(true)
        confirmEmailLink(token, decodeURIComponent(em))
            .then(onSuccess)
            .catch(err => {
                setVerifying(false)
                setResult({
                    code: err.error,
                    type: `error`,
                    title: err.error == FlareErrors.authEmailAlreadyVerified ? `Already verified` : `Verification failed`,
                    message: err.error == FlareErrors.authEmailAlreadyVerified ? `Your account is already verified. Continue to Login` : err.message ?? `Verification failed`
                })
            })
    }

    useEffect(() => {
        
        document.title = `Verify Email`
        
        if ( token && _(token).isEmail() ){
            setVerifying(false)
            setTimeout(() => {
                setSend(true)
            }, 10_000)
        }
        else autoVerify()
        // else onAuthConfigLoaded(() => autoVerify())

    }, [])

    // useEffect(() => {}, [done])
    console.log(`-- render`, verifying, result)

    return <Group
        as={`h:100vh w:50vw bg:$surface abs abc flex aic jcc p:150 cols gap:15`}>
        <Cover when={verifying} message={`verfying...`} />
        { result ? <Done 
            type={result.type}
            title={result.title} 
            message={result.message} />
        : <Form 
            name={`verify`}
            onSubmit={async (data:dynamic) => {
                setVerifying(true)
                verifyEmailWithCode(decodeURIComponent(token), data.code)
                    .then(onSuccess)
                    .catch(err => {
                        setVerifying(false)
                        const s = snack.ok({
                            title: err.error == FlareErrors.authEmailAlreadyVerified ? `Already verified` : `Verification failed`,
                            message: err.error == FlareErrors.authEmailAlreadyVerified ? `Your account is already verified. Continue to Login` : err.message ?? `Verification failed`,
                            icon: `frame`,
                            sticky: true
                        }, {
                            label: err.error == FlareErrors.authInvalidToken ? `Re-send code` : err.error == FlareErrors.authEmailAlreadyVerified ? `Sign in` : `Ok`,
                            onClick: (e) => {
                                if ( err.error == FlareErrors.authInvalidToken  ){
                                    router.push(`/u/recover?resend=1`)
                                }
                                else if ( err.error == FlareErrors.authEmailAlreadyVerified ){  
                                    router.push(`/u/signin`)
                                }
                                else s.hide()
                            }
                        })
                    })
            }}
            errors={{
                code: `Verification Code is required`,
            }}
            as={`flex cols w:320 gap:12`}>
            
            <Text as={`s:18 mb:10`}>We have sent you a verification code{em ? <> to <b>{decodeURIComponent(em)}</b></> : null}</Text>

            <PinInput name={`code`} as={`s:xl! b:900`} length={6} required />
            
            <Button type={`submit`} as={`mt:25 bold`}>Verify</Button>

            { resend && <Box as={`mt:25 s:16`}>Code not received? <Link href={`/u/recover?resend=1`} className={css(`tdn bold &hover(tdu)`)}>Re-send code</Link></Box> }

        </Form>}
    </Group>
}

export default Verify;