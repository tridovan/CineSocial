import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AuthenticatePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const isCalled = useRef(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const authenticate = async () => {
            const code = searchParams.get('code');
            if (!code) {
                setError('No authorization code found');
                navigate('/login');
                return;
            }

            if (isCalled.current) return;
            isCalled.current = true;

            try {
                const response = await authService.outboundAuthentication(code);

                // Check if response matches expectations (adjust based on actual API response structure)
                // Previous service returns response.data directly.
                // Assuming response structure is ApiResponseAuthenticationResponse { code: number, result: ... } 
                // OR the service returns the data object directly which contains the token.
                // Let's look at authService again. It returns response.data.
                // ApiResponseAuthenticationResponse has 'data' field which is AuthenticationResponse.

                if (response && response.data && response.data.token) {
                    login(null, response.data.token);
                    toast.success('Logged in with Google successfully');
                    navigate('/');
                } else {
                    console.error('Invalid response structure:', response);
                    throw new Error('Authentication failed');
                }

            } catch (err: any) {
                console.error('Google Auth Error:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Authentication failed';
                setError(errorMessage);
                toast.error('Google Login Failed');
                // Removed auto-redirect so user can see the error
            }
        };

        authenticate();
    }, [searchParams, navigate, login]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg-dark text-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center space-y-4 max-w-sm w-full">
                {error ? (
                    <>
                        <div className="text-red-600 font-bold text-xl mb-2">Authentication Failed</div>
                        <p className="text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg text-sm break-words w-full">
                            {error}
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                        >
                            Back to Login
                        </button>
                    </>
                ) : (
                    <>
                        <Loader2 className="animate-spin text-brand-red" size={48} />
                        <h2 className="text-2xl font-bold text-gray-900">Authenticating...</h2>
                        <p className="text-gray-500">Please wait while we log you in with Google.</p>
                    </>
                )}
            </div>
        </div>
    );
};
