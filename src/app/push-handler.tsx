/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useEffect } from 'react';

const PushHandler : React.FC = (_props) => {

    useEffect(() => {
        const handler = (e: MessageEvent) => {
            if (e.data?.type === 'PUSH_NOTIFICATION') {
                console.log("Received push notification message from service worker:", e.data);
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

export default PushHandler;