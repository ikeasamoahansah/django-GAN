import api from "./calls";

export const getCSRF = () => api.get("/api/csrf/");

export const login = (username: string, password: string) =>
    api.post("/api/auth/login/", {
        username,
        password,
    });
    
export const logout = () =>
    api.post("/api/auth/logout/");

export const getMe = () =>
    api.get("/api/auth/me/");

export const googleOAuth = (token: string) =>
    api.post("/api/auth/google/", { token });