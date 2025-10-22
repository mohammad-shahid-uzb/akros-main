export const loginWithTelegram = async (userData) => {
    try {
        const res = await fetch("http://localhost:4000/api/auth/telegram", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return await res.json();
    } catch (err) {
        console.error("Telegram login failed:", err);
        return null;
    }
};
