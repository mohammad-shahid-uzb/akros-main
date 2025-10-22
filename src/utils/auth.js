// src/utils/auth.js

export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        // Decode the JWT payload (2nd part of the token)
        const payload = JSON.parse(atob(token.split(".")[1]));
        const exp = payload.exp * 1000;

        if (Date.now() > exp) {
            localStorage.removeItem("token");
            return false;
        }
        return true;
    } catch (e) {
        console.error("Invalid token:", e);
        return false;
    }
};

export const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};
