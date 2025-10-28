import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import './Login.css';

interface LoginProps {
    onLogin: (username: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!username.trim()) {
            setError('Please enter your username');
            return;
        }

        if (!password.trim()) {
            setError('Please enter your password');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            // Call the onLogin callback
            await onLogin(username, password);
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">
                        <FontAwesomeIcon icon={faUser} size="3x" />
                    </div>
                    <h1>Welcome</h1>
                    <p>Enter your credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">
                            <FontAwesomeIcon icon={faUser} className="input-icon" />
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <FontAwesomeIcon icon={faLock} className="input-icon" />
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSignInAlt} />
                                Continue
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>New users will be automatically registered</p>
                </div>
            </div>
        </div>
    );
}
