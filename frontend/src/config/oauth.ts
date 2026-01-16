export const OAUTH_CONFIG = {
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '795626981438-ga1histhjalvq2res4m53l8htg6f4tgh.apps.googleusercontent.com',
    REDIRECT_URI: 'http://localhost:5173/authenticate',
    AUTH_URI: 'https://accounts.google.com/o/oauth2/auth',
};

export const getGoogleAuthUrl = () => {
    const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.GOOGLE_CLIENT_ID,
        redirect_uri: OAUTH_CONFIG.REDIRECT_URI,
        response_type: 'code',
        scope: 'email profile openid',
        prompt: 'select_account'
    });
    return `${OAUTH_CONFIG.AUTH_URI}?${params.toString()}`;
};
