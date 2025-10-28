import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    username: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

function isTokenExpired(expiryTime: string | null): boolean {
    if (!expiryTime) return true;
    return Date.now() >= parseInt(expiryTime);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        // Check if user has a valid token
        const token = localStorage.getItem('access_token');
        const expiryTime = localStorage.getItem('token_expiry');
        return token !== null && !isTokenExpired(expiryTime);
    });
    const [username, setUsername] = useState<string | null>(() => {
        return localStorage.getItem('username');
    });

    // Token refresh function
    const refreshToken = async (): Promise<boolean> => {
        const currentToken = localStorage.getItem('access_token');
        if (!currentToken) return false;

        try {
            const response = await fetch('http://localhost:8787/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`,
                },
            });

            const data = await response.json();

            if (data.success && data.access_token) {
                const expiryTime = Date.now() + TOKEN_EXPIRY_TIME;
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('token_expiry', expiryTime.toString());
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    };

    // Check token expiration and refresh before it expires
    useEffect(() => {
        const checkAndRefreshToken = async () => {
            const expiryTime = localStorage.getItem('token_expiry');

            if (!expiryTime) {
                return;
            }

            const timeUntilExpiry = parseInt(expiryTime) - Date.now();

            // If token has already expired, logout
            if (timeUntilExpiry <= 0) {
                logout();
                return;
            }

            // If token expires in less than 5 minutes, try to refresh
            if (timeUntilExpiry < 5 * 60 * 1000) {
                const refreshed = await refreshToken();
                if (!refreshed) {
                    logout();
                }
            }
        };

        // Check immediately
        checkAndRefreshToken();

        // Check every minute
        const interval = setInterval(checkAndRefreshToken, 60000);

        return () => clearInterval(interval);
    }, []);

    const login = async (username: string, password: string): Promise<void> => {
        const response = await fetch('http://localhost:8787/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Authentication failed');
        }

        // Calculate token expiry time (1 hour from now)
        const expiryTime = Date.now() + TOKEN_EXPIRY_TIME;

        // Store access token and expiry time
        setIsAuthenticated(true);
        setUsername(data.username);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_expiry', expiryTime.toString());
        localStorage.setItem('username', data.username);
        localStorage.setItem('user_id', data.user_id);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUsername(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
    };

    const getAccessToken = (): string | null => {
        const token = localStorage.getItem('access_token');
        const expiryTime = localStorage.getItem('token_expiry');

        if (isTokenExpired(expiryTime)) {
            logout();
            return null;
        }

        return token;
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, username, login, logout, getAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
