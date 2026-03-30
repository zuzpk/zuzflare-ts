"use client"
import { APP_NAME, LocalDB, REDIRECT_AFTER_OAUTH } from '@/config';
import { refreshAuthSession, sendEmailVerification, signInWithEmailAndPassword } from '@/flare';
import { Store } from '@/store';
import { dynamic } from '@zuzjs/core';
import { FlareErrors, FlareResponseCodes } from '@zuzjs/flare';
import { useDB } from '@zuzjs/hooks';
import { useStore } from '@zuzjs/store';
import { Button, css, Form, FormHandler, FORMVALIDATION, Group, Input, Password, SnackPosition, Text, useSnack, useToast } from '@zuzjs/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Signin : React.FC = (_props) => {

    const { loading, uid, dispatch } = useStore<{
        loading: boolean;
        uid: string | null;
    }>(
        Store.User,
        (s) => ({
            loading: s.loading,
            uid: s.uid,
        }),
        (prev, next) => prev.loading === next.loading && prev.uid === next.uid,
    )
    const router = useRouter();
    const { insert } = useDB(LocalDB.App)
    const toast = useToast()
    const snack = useSnack()
    const form = useRef<FormHandler>(null)
    const [ done, setDone ] = React.useState<string | null>(null)

    // const onSuccess = useCallback((resp: dynamic) => {
    //     insert(`you`, resp.u)
    //     dispatch({ ...resp.u, loading: false }).then(() => router.push(`${REDIRECT_AFTER_OAUTH}?_=${Date.now()}`))
    // }, [insert, dispatch, router])

    // const onFailed = useCallback((err: dynamic) => {
    //     toast.error(err.message)
    // }, [toast])

    const onEmailNotVerified = useCallback((err: any, email: string) => {
        const _snack = snack.confirm(
            {
                title: `Signin Failed`,
                message: err.message,
                icon: `frame`,
                sticky: true,
                width: 300
            }, 
            {
                label: `Resend Verification Email`,
                onClick: (e) => {

                    _snack.update({
                        width: 200,
                        actions: [],
                        title: `Sending Verification Email`,
                        message: `Please wait...`,
                        busy: true
                    })

                    sendEmailVerification(email)
                        .then(() => {
                            _snack.update({
                                width: 200,
                                actions: [],
                                title: `Verification Email Sent`,
                                message: `Please check your inbox.`,
                                busy: false
                            })
                        })
                        .catch((err) => {
                            _snack.update({
                                width: 200,
                                actions: [],
                                title: `Failed to Send Verification Email`,
                                message: err.message,
                                busy: false
                            })
                        })

                }
            },
            {
                label: `Close`,
                onClick: (e) => {
                    // e.preventDefault();
                    // e.stopPropagation();
                }
            },
        )
    }, [snack])

    useEffect(() => {
        if ( !loading && uid ){
            router.push(`${REDIRECT_AFTER_OAUTH}?_=${Date.now()}`)
        }
    }, [loading, uid, router])

    useEffect(() => {
        document.title = `Signin to ${APP_NAME}`
    }, [])

    return <Group 
        as={`abs abc flex aic jcc cols gap:15`}>
        <Form 
            ref={form}
            name={`signin`}
            onSubmit={async (data : dynamic) => {
                form.current?.setLoading(true);
                snack.clearAll()
                signInWithEmailAndPassword(data.em, data.psw)
                    .then(resp => {
                        refreshAuthSession().catch(() => {})
                        if ( 
                            resp.kind == FlareResponseCodes.authSession &&
                            resp.refreshToken
                        ){
                            router.push(`${REDIRECT_AFTER_OAUTH}?_=${Date.now()}`)
                        }
                        else {
                            form.current?.setLoading(false)
                            toast.error(`Unexpected response from server. Please try again later.`)
                        }
                    })
                    .catch(err => {
                        form.current?.setLoading(false)
                        const error = err.error || err.code || null;
                        if ( error === FlareErrors.authWrongPassword ){
                            snack.ok({
                                title: `Signin Failed`,
                                message: err.message || `Invalid email or password. Please try again.`,
                                icon: `frame`,
                                sticky: true,
                                position: SnackPosition.BottomCenter
                            }, {
                                label: `Recover Password`,
                                onClick: (e) => {
                                    router.push(`/u/recover`)
                                }
                            })
                        }
                        else if ( error === FlareErrors.authInvalidEmail ){
                            snack.ok({
                                title: `Signin Failed`,
                                message: err.message || `That email is not registered with us.`,
                                icon: `frame`,
                                sticky: true,
                                position: SnackPosition.BottomCenter
                            }, {
                                label: `Signup Instead`,
                                onClick: (e) => {
                                    router.push(`/u/signup`)
                                }
                            })
                        }
                        else if ( error === FlareErrors.authEmailNotVerified ){
                            onEmailNotVerified(err, data.em)
                        }
                    })
            }}
            // onSuccess={onSuccess}
            // onError={onFailed}
            errors={{
                em: `Valid email is required`,
                psw: `Password is required`,
            }}
            as={`flex cols w:320 gap:12`}>

            {/* <Button as={`flex aic gap:8`}>
                <Icon name={`google`} />
                <Text>Sign in with Google</Text>
            </Button> */}
            
            <Text as={`s:xl b:700 mb:10`}>Signin to {APP_NAME}</Text>

            <Input name={`em`} placeholder={`Email`} required with={FORMVALIDATION.Email} />
            <Password name={`psw`} placeholder={`Password`} required />
            
            <Button type={`submit`} as={`mt:25 bold`}>Sign in</Button>

            <Text as={`mt:35 s:md`}><Link className={css(`s:md tdn bold &hover(tdu)`)} href={`/u/recover`}>Forgot Password?</Link></Text>
            <Text as={`s:md`}>New here? <Link className={css(`s:md tdn bold &hover(tdu)`)} href={`/u/signup`}>Create account</Link></Text>

        </Form>
    </Group>
}

export default Signin;