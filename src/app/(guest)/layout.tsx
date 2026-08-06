import { fetchAuthConfig } from "../api/auth";
import Wrapper from "./wrapper";

const RootLayout = async ({ children, }: Readonly<{ children: React.ReactNode; }>) => {

  return <Wrapper 
    authConfig={await fetchAuthConfig()}>{children}</Wrapper>
}

export default RootLayout