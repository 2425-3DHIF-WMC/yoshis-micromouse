"use client";

import React, { useState, useEffect } from "react";
import "./Login.css";

export default function Login({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Login erfolgreich!");
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", username);
                setIsLoggedIn(true);
                onLoginSuccess(data.token);
            } else {
                setMessage(data.error || "Login fehlgeschlagen.");
            }
        } catch {
            setMessage("Ein Fehler ist aufgetreten.");
        }
    };

    const handleRegister = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Registrierung erfolgreich!");
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", username);
                setIsLoggedIn(true);
                onLoginSuccess(data.token);
            } else {
                setMessage(data.error || "Registrierung fehlgeschlagen.");
            }
        } catch {
            setMessage("Ein Fehler ist aufgetreten.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setMessage("Erfolgreich abgemeldet.");
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">Login</h1>
                {!isLoggedIn ? (
                    <>
                        <input
                            type="text"
                            placeholder="Benutzername"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-input"
                        />
                        <input
                            type="password"
                            placeholder="Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                        />
                        <div className="button-container">
                            <button onClick={handleLogin} className="login-button login-primary">
                                Login
                            </button>
                            <button onClick={handleRegister} className="login-button login-secondary">
                                Registrieren
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="logged-in-container">
                        <p className="logged-in-text">Du bist angemeldet.</p>
                        <button onClick={handleLogout} className="login-button logout-button">
                            Logout
                        </button>
                    </div>
                )}
                {message && <p className="login-message">{message}</p>}
            </div>
        </div>
    );
}