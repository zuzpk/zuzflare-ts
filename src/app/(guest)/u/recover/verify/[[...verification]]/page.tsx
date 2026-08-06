"use client"
import Done from '@/app/done'
import { confirmEmailLink, recoverAccountWithCode } from '@/flare'
import { _, dynamic } from "@zuzjs/core"
import { FlareErrors } from '@zuzjs/flare'
import { Box, Button, Cover, css, Fieldset, Flex, Form, FORMVALIDATION, Group, Password, PinInput, SheetHandler, Text, useSnack, Variant } from '@zuzjs/ui'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Sent : React.FC = (_props) => {

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
    const toast = useRef<SheetHandler | null>(null)
    const verifyingRef = useRef(false)

    const onSuccess = (resp : dynamic) => {
        setVerifying(false)
        setResult({
            code: `verified`,
            type: `success`,
            title: `Good Job, ${resp.name ?? `That was easy :)`}`,
            message: `Your password is updated. Go Sign in`
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
        
        document.title = `Verify Recover Code`
        
        if ( token && _(token).isEmail() ){
            setVerifying(false)
            setTimeout(() => {
                setSend(true)
            }, 10_000)
        }
        else autoVerify()
        // else onAuthConfigLoaded(() => autoVerify())

    }, [])
    

    return <Group 
        as={`abs abc flex aic jcc cols gap:15`}>
        <Cover when={verifying} message={`verfying...`} />
        { result ? <Done 
            type={result.type}
            title={result.title} 
            message={result.message} />
        : <Form 
            name={`verify`}
            onSubmit={async (data:dynamic) => {
                setVerifying(true)
                recoverAccountWithCode(
                    decodeURIComponent(token), 
                    data.code,
                    data.repassw
                )
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
                passw: `New Password is required`,
                repassw: `Passwords do not match`
            }}
            as={`flex cols w:400`}>
            
            <Text as={`s:lg tac`}>We have sent you a verification code</Text>
            {em || _(token).isEmail() ? 
                <Text as={`s:md mb:30 tac dim-50`}>to <b>{decodeURIComponent(em || token)}</b></Text>
            : null}

            <Fieldset legend={`New Password`} as={`flex cols gap:12 p:25 r:40!`}>
                <Password variant={Variant.Medium} name={`passw`} placeholder={`New Password`} required />
                <Password variant={Variant.Medium} name={`repassw`} placeholder={`Repeat Password`} required with={`${FORMVALIDATION.MatchField}@passw` } />
            </Fieldset>

            <Fieldset legend={`Verification Code`} as={`flex cols gap:12 p:25 mt:25 r:40!`}>
                <PinInput name={`code`} as={`s:xl! b:900`} length={6} required />
            </Fieldset>
            
            <Flex as={`p:10,25`}>
                <Button type={`submit`} as={`mt:25 bold w:full`}>Update Password</Button>
            </Flex>

            { resend && <Box as={`mt:25 s:16`}>Code not received? <Link href={`/u/recover?resend=1`} className={css(`tdn bold &hover(tdu)`)}>Re-send code</Link></Box> }

        </Form>}
    </Group>
}

export default Sent