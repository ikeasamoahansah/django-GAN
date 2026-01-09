import api from "./calls";

export const getCSRF = () => api.get("/api/csrf/");

export const login = (username: string, password: string) =>
    api.post("/api/auth/login/", {
        username,
        password,
    });
    
export const logout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return api.post("/api/auth/logout/", { 
        refresh_token: refreshToken 
    });
};

export const getMe = () =>
    api.get("/api/auth/me/");

export const googleLogin = (token: string) =>
    api.post("/api/auth/google/", { token });