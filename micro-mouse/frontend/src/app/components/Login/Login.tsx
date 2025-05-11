"use client";

import React, { useState } from "react";
import "./Login.css";

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:3001/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                setMessage("Login erfolgreich!");
                onLoginSuccess();
            } else {
                setMessage("Login fehlgeschlagen. Bitte überprüfe deine Anmeldedaten.");
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
            } else {
                setMessage(data.error || "Registrierung fehlgeschlagen.");
            }
        } catch {
            setMessage("Ein Fehler ist aufgetreten.");
        }
    };

    return (
        <div className="login-container">
            <h1 className="login-title">Login</h1>
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
                <button onClick={handleLogin} className="login-button">
                    Login
                </button>
                <button onClick={handleRegister} className="login-button">
                    Registrieren
                </button>
            </div>
            {message && <p className="login-message">{message}</p>}
        </div>
    );
}