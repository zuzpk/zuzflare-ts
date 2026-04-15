"use client"
import { APP_NAME, LocalDB, REDIRECT_AFTER_OAUTH, SESS_NAME } from '@/config';
import { createUserWithEmailAndPassword, sendEmailVerification } from '@/flare';
import { Store } from '@/store';
import { dynamic, setCookie } from '@zuzjs/core';
import { FlareErrors, FlareResponseCodes } from '@zuzjs/flare';
import { useDB } from '@zuzjs/hooks';
import { useStore } from '@zuzjs/store';
import { Button, css, Form, FormHandler, FORMVALIDATION, Group, Input, Password, SnackPosition, Text, useSnack, useToast } from '@zuzjs/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Page : React.FC = (_props) => {

    const { violations, dispatch: appDispatch } = useStore<{
        violations: string[];
    }>(
        Store.App,
        (s) => ({
            violations: s.violations,
        }),
        (prev, next) => prev.violations === next.violations,
    )
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
    
    const onSuccess = useCallback((resp: dynamic) => {
        insert(`you`, resp.u)
        dispatch({ ...resp.u, loading: false }).then(() => router.push(`${REDIRECT_AFTER_OAUTH}?_=${Date.now()}`))
    }, [insert, dispatch, router])

    const onFailed = useCallback((err: dynamic) => {
        toast.error(err.message)
    }, [toast])

    const onEmailNotVerified = useCallback((err: any, email: string) => {
        const _snack = snack.confirm(
            {
                title: `Signup Failed`,
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

    const onSubmit = async (data : dynamic) => {
        form.current?.setLoading(true);
        snack.clearAll()
        createUserWithEmailAndPassword(
            data.em, 
            data.psw,
            {
                additionalParams: {
                    name: data.nm
                }
            }
        )
        .then(resp => {

            console.log(`Signup response:`, resp)

            if ( resp.kind == FlareResponseCodes.authRegistration ){
                if ( resp.verificationRequired || resp.verification_required ){
                    router.push(`/u/verify/${encodeURIComponent(data.em)}`)
                }else if ( resp.refreshToken ){
                    setCookie({
                        key: SESS_NAME,
                        value: resp.refreshToken,
                        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
                        json: false,
                        sameSite: 'lax',
                        secure: window.location.protocol === 'https:',
                    })
                    router.push(`${REDIRECT_AFTER_OAUTH}?_=${Date.now()}`)
                }
                else {
                    router.push(`/u/verify/${encodeURIComponent(data.em)}?_=${Date.now()}`)
                }
            }
            else if ( resp.kind == FlareResponseCodes.authRegistrationVerificationRequired ){
                router.push(`/u/verify/${encodeURIComponent(data.em)}`)
            }
        })
        .catch(err => {
            form.current?.setLoading(false)
            const errCode = err.code ?? err.error?.code ?? err.error ?? null;
            if ( errCode === FlareErrors.authWeakPassword ){
                if (err.violations) {
                    appDispatch({ violations: err.violations })
                }
                snack.ok({
                    title: `Signup Failed`,
                    message: err.message || `Password is too weak. Please choose a stronger password.`,
                    icon: `frame`,
                    sticky: true,
                    position: SnackPosition.BottomCenter
                })
            }
            else if ( errCode === FlareErrors.authEmailAlreadyInUse ){
                snack.ok({
                    title: `Signup Failed`,
                    message: err.message || `Email is already in use. Please choose a different email.`,
                    icon: `frame`,
                    sticky: true,
                    width: 300,
                    position: SnackPosition.BottomCenter
                }, {
                    label: `Signin Instead`,
                    onClick: (e) => {
                        router.push(`/u/signin`)
                    }
                })
            }
            else if ( errCode === FlareErrors.authWrongPassword ){
                snack.ok({
                    title: `Signin Failed`,
                    message: err.message || `Invalid email or password. Please try again.`,
                    icon: `frame`,
                    sticky: true,
                    position: SnackPosition.BottomCenter
                })
            }
            else if ( errCode === FlareErrors.authInvalidEmail ){
                snack.ok({
                    title: `Signup Failed`,
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
            else if ( errCode === FlareErrors.authEmailNotVerified ){
                onEmailNotVerified(err, data.em)
            }
        })
    }

    useEffect(() => {
        if ( !loading && uid ){
            router.push(`${REDIRECT_AFTER_OAUTH}?_=${Date.now()}`)
        }
    }, [loading, uid, router])

    useEffect(() => {
        document.title = `Signup to ${APP_NAME}`
        appDispatch({ violations: [] })
    }, [])

    return <Group 
        as={`abs abc flex aic jcc cols gap:15`}>
        <Form 
            ref={form}
            name={`signup`}
            onSubmit={onSubmit}
            onSuccess={onSuccess}
            onError={onFailed}
            errors={{
                em: `Valid email is required`,
                psw: `Password is required`,
            }}
            as={`flex cols w:320 gap:12`}>

            {/* <Button as={`flex aic gap:8`}>
                <Icon name={`google`} />
                <Text>Sign in with Google</Text>
            </Button> */}
            
            <Text as={`s:xl b:700 mb:10`}>Create account</Text>
            <Input name={`nm`} placeholder={`Name`} required />
            <Input name={`em`} placeholder={`Email`} required with={FORMVALIDATION.Email} />
            <Password name={`psw`} placeholder={`Password`} required />
            <Password name={`rpsw`} placeholder={`Repeat Password`} required with={`${FORMVALIDATION.MatchField}@psw`} />
            
            <Button type={`submit`} as={`mt:25 bold`}>Create Account</Button>

            <Text as={`s:md mv:35`}>By clicking "Create account", you agree to the <Link className={css(`s:md tdn bold &hover(tdu)`)} href={`/help/terms` as any}>{APP_NAME} TOS</Link> and <Link className={css(`tdn bold &hover(tdu)`)} href={`/help/privacy` as any}>Privacy Policy.</Link></Text>
            <Text as={`s:md`}>Already have an account? <Link className={css(`s:md tdn bold &hover(tdu)`)} href={`/u/signin`}>Sign in here</Link></Text>

        </Form>
    </Group>
}

export default Page;