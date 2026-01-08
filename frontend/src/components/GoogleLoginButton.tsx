import { GoogleLogin } from '@react-oauth/google';
import { googleOAuth } from '../api/auth';

export default function LoginButton() {
  const handleSuccess = async (credentialResponse: { credential: string }) => {
    try {
        // const response = await fetch('http://localhost:8000/api/auth/google/', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     token: credentialResponse.credential
        //   })
        // });
        const token = credentialResponse.credential
        // get the access_token
        // googleOAuth resolves to the axios response, so get the access_token from its data
        const response = await googleOAuth(token);
        const data = response.data;
        // Store the JWT or session token from Django
        localStorage.setItem('googleToken', data.access_token);
        // Redirect or update app state
      } catch (error) {
        console.error('Login failed:', error);
      }
  }

  const handleError = () => {
    console.error('Login Failed')
  }

  return <GoogleLogin onSuccess={handleSuccess as any} onError={handleError} />
}
