"use client"
import { CookiesConsent, Variant } from '@zuzjs/ui';
import React, { ReactNode } from 'react';
import AppThemeProvider from './providers/theme';

const RootWrapper : React.FC<{ children: ReactNode }> = ({ children }) => {

    return <AppThemeProvider>
        {children}
        <CookiesConsent variant={Variant.Small} />
    </AppThemeProvider>
}

export default RootWrapper;