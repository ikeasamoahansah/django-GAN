import React, { useState, useEffect } from "react";
import { getCSRF, login } from "../api/auth";


interface LoginModalProps {
    show: boolean;
    onClose: () => void;
    onLoginSuccess: (u: string, p: string) => Promise<void>;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onClose, onLoginSuccess }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (show) getCSRF(); // ensure CSRF cookie exists
    }, [show]);


    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(username, password);
            onClose();
        } catch (err: any) {
            setError(
                err.response?.data?.message || "An error occurred during login"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-[#232323] rounded-lg shadow-xl w-full max-w-sm p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={onClose}
                    aria-label="Close Modal"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-4 text-white">Sign In</h2>
                <form onSubmit={handleLogin} className="flex flex-col">
                    <label className="text-white mb-1" htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        className="mb-3 px-3 py-2 rounded bg-[#333] text-white border border-[#444] focus:border-[#777] outline-none"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        autoFocus
                        autoComplete="username"
                        required
                    />
                    <label className="text-white mb-1" htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        className="mb-3 px-3 py-2 rounded bg-[#333] text-white border border-[#444] focus:border-[#777] outline-none"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />
                    {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#3E3E42] hover:bg-[#444] transition-colors text-white font-medium py-2 px-4 rounded mt-2 disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;