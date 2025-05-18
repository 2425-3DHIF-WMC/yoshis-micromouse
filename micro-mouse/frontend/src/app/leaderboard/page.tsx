"use client";

import React, { useEffect, useState } from "react";
import "./page.css";

interface IScore {
    username: string;
    score: string;
}

export default function Page() {
    const [leaderboardData, setLeaderboardData] = useState<IScore[]>([]);
    const [currentUser, setCurrentUser] = useState("Unbekannt");

    useEffect(() => {
        const username = localStorage.getItem("username") || "Unbekannt";
        setCurrentUser(username);

        const fetchLeaderboard = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/user/scores");
                const data: IScore[] = await response.json();
                setLeaderboardData(data);
            } catch (error) {
                console.error("Fehler beim Abrufen der Leaderboard-Daten:", error);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="leaderboard-container">
            <h1>Leaderboard</h1>
            <table className="leaderboard-table">
                <thead>
                <tr>
                    <th>Rang</th>
                    <th>Name</th>
                    <th>Punkte</th>
                </tr>
                </thead>
                <tbody>
                {leaderboardData.map((entry, index) => (
                    <tr
                        key={index}
                        className={entry.username === currentUser ? "current-user" : ""}
                    >
                        <td>{index + 1}</td>
                        <td>{entry.username}</td>
                        <td>{entry.score}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <table className="current-user-table">
                <thead>
                <tr>
                    <th>Rang</th>
                    <th>Name</th>
                    <th>Punkte</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{leaderboardData.findIndex((entry) => entry.username === currentUser) + 1 || "-"}</td>
                    <td>{currentUser}</td>
                    <td>
                        {leaderboardData.find((entry) => entry.username === currentUser)?.score || 0}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}