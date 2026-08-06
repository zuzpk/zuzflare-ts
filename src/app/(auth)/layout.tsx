import { fetchAuthConfig, fetchCurrentUser } from "../api/auth";
import AuthWrapper from "./wrapper";

const RootLayout = async ({ children, }: Readonly<{ children: React.ReactNode; }>) => {
  
  const currentUser = await fetchCurrentUser()
    
  return <AuthWrapper
          currentUser={currentUser} 
          authConfig={await fetchAuthConfig()}>{children}</AuthWrapper>
}

export default RootLayout