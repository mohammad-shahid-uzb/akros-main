import { useEffect } from "react";
import { loginWithTelegram } from "../config/auth";

const TelegramLogin = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://telegram.org/js/telegram-widget.js?7";
        script.async = true;
        script.setAttribute("data-telegram-login", "@akrosdata_bot"); // change this
        script.setAttribute("data-size", "large");
        script.setAttribute("data-onauth", "onTelegramAuth(user)");
        document.getElementById("telegram-login-container").appendChild(script);

        window.onTelegramAuth = async function (user) {
            const result = await loginWithTelegram(user);
            if (result?.token) {
                alert("Login successful!");
                window.location.href = "/admin"; // redirect to protected page
            } else {
                alert("Login failed!");
            }
        };
    }, []);

    return <div id="telegram-login-container"></div>;
};

export default TelegramLogin;
