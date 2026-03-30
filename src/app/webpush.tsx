/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import { getCookie } from '@zuzjs/core';
import { usePushNotifications } from '@zuzjs/hooks';
import React, { useEffect } from 'react';

const PushNotifications : React.FC = (_props) => {

    const VAPID_PUBLIC_KEY = getCookie(`__push`)

    const {
        permission,
        subscribe,
    } = usePushNotifications({
        vapidPublicKey: VAPID_PUBLIC_KEY,
        requestPermissionOnMount: true,
    })

    useEffect(() => {
        if ( `granted` == permission ){
            subscribe()
            .then(meta => {
                
                // withPost<{
                //     kind: string
                // }>(
                //     `/@/u/push_oauth`,
                //     { token: meta }
                // )
                // .then(() => {})
                // .catch(() => {})

            })
        }
    }, [permission, subscribe])

    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.type === 'PUSH_NOTIFICATION') {
                const audio = new Audio(e.data.soundUrl);
                audio.play().catch(() => {
            });
        }
        };

        navigator.serviceWorker?.addEventListener('message', handler);
        return () => navigator.serviceWorker?.removeEventListener('message', handler);
    }, []);

    return null

}

export default PushNotifications;