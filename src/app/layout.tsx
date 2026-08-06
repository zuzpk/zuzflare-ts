import "@/app/css/app.scss";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE, APP_VERSION } from "@/config";
import type { Metadata } from "next";
import RootWrapper from "./wrapper";

export const metadata: Metadata = {
  title: `${APP_NAME}: ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    return <html suppressHydrationWarning lang="en">
        <head>
            <link rel="preconnect" href="https://glyph.zuzcdn.net" />
            <link rel="stylesheet" href={`https://glyph.zuzcdn.net/fonts/w5AAX8JBpFVEG1HPOq/styles.css?v=${process.env.NODE_ENV == `development` ? Date.now() : APP_VERSION}`} />
        </head>
        <body>
            <RootWrapper>
              {children} 
            </RootWrapper>
        </body>
    </html>
    
}