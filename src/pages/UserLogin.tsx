import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../assets/styles.css';
import axios from 'axios';

interface LoginResponse {
    success: boolean;
    message: string;
    mustChangePassword?: boolean;
}

const UserLogin: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await axios.get('/api/check-session', { withCredentials: true });
                if (response.data.isAuthenticated) {
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error('Session check failed:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkSession();
    }, [navigate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Submitting login form:', { username, password });
        try {
            const response = await axios.post<LoginResponse>(
                '/api/login',
                { username, password },
                { withCredentials: true }
            );
            console.log('Login response:', response.data);
            if (response.data.success) {
                if (response.data.mustChangePassword) {
                    navigate('/change-password');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(response.data.message);
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error('Axios error:', err.response?.data);
                setError(err.response?.data?.message || 'ログインに失敗しました。もう一度お試しください。');
            } else {
                console.error('Unknown error:', err);
                setError('予期せぬエラーが発生しました。');
            }
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="login">
            <h1>ログイン</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    ユーザー名:
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="userid@company_code"
                        required
                    />
                </label>
                <label>
                    パスワード:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">ログイン</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default UserLogin;
