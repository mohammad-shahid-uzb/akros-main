import { useEffect } from "react";

function LoginPage() {
    useEffect(() => {
        // Define the global callback function (Telegram will call this)
        window.onTelegramAuth = function (user) {
            console.log("Telegram user authenticated:", user);

            fetch("https://green-book-server-production.up.railway.app/api/auth/telegram", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.token) {
                        localStorage.setItem("token", data.token);
                        window.location.href = "/admin"; // Redirect to dashboard
                    } else {
                        alert("Login failed");
                    }
                })
                .catch((err) => console.error("Login error:", err));
        };

        // Dynamically load Telegram login widget script
        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-widget.js?7";
        script.async = true;
        script.setAttribute("data-telegram-login", "akrosdata_bot"); // ✅ your bot username without '@'
        script.setAttribute("data-size", "large");
        script.setAttribute("data-onauth", "onTelegramAuth(user)");
        script.setAttribute("data-request-access", "write"); // optional: ask permission to message
        document.getElementById("telegram-login-container").appendChild(script);

        // Cleanup when leaving the page
        return () => {
            const container = document.getElementById("telegram-login-container");
            if (container) container.innerHTML = "";
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-6">Login with Telegram</h1>
            <div id="telegram-login-container"></div>
        </div>
    );
}

export default LoginPage;
