import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../assets/styles.css';
// @ts-ignore
import axios, { AxiosError } from 'axios';

// Type guard to check if the error is an AxiosError
const isAxiosError = (error: unknown): error is AxiosError => {
    return (error as AxiosError).isAxiosError !== undefined;
};

interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const checkSession = async () => {
            try {
                await axios.get('http://localhost:3000/api/check-session', { withCredentials: true });
            } catch (err) {
                navigate('/');
            }
        };
        checkSession();
    }, [navigate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('新しいパスワードと確認用パスワードが一致しません。');
            return;
        }

        try {
            const response = await axios.post<ChangePasswordResponse>(
                'http://localhost:3000/api/change-password',
                { currentPassword, newPassword },
                { withCredentials: true }
            );

            if (response.data.success) {
                setSuccess('パスワードが正常に変更されました。');
                setTimeout(() => navigate('/dashboard'), 2000);
            } else {
                setError(response.data.message);
            }
        } catch (err: unknown) {
            if (isAxiosError(err) && err.response) {
                if (err.response.status === 403) {
                    setError('セッションが無効です。再度ログインしてください。');
                    setTimeout(() => navigate('/'), 2000);
                } else {
                    setError(err.response.data.message || 'パスワードの変更に失敗しました。もう一度お試しください。');
                }
            } else {
                setError('パスワードの変更に失敗しました。もう一度お試しください。');
            }
        }
    };

    return (
        <div className="change-password">
            <h1>パスワード変更</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    現在のパスワード:
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </label>
                <label>
                    新しいパスワード:
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </label>
                <label>
                    新しいパスワード（確認）:
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">パスワードを変更</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
        </div>
    );
};

export default ChangePassword;