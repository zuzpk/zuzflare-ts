import { fetchAuthConfig, fetchCurrentUser } from "./api/auth";
import Wrapper from "./wrapper";

const RootLayout = async ({ children, }: Readonly<{ children: React.ReactNode; }>) => {
  const currentUser = await fetchCurrentUser()

  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link rel="preconnect" href="https://icons.zuzcdn.net" />
        <link rel="stylesheet" href="https://icons.zuzcdn.net/public/pP52L1YW/style.css" />
      </head>
      <body>
        <Wrapper currentUser={currentUser} authConfig={await fetchAuthConfig()}>{children}</Wrapper>
      </body>
    </html>
  );
}

export default RootLayout