import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from "@/views/public/auth/Login";

export default function Page() {
  return (
    <GoogleOAuthProvider 
    clientId="575960613940-j1vt07o084g9i8179pds5i9083gm8b0h.apps.googleusercontent.com">
      <Login />
    </GoogleOAuthProvider>
  );
}
