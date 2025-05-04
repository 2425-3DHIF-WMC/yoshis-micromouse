"use client";

import React from "react";
import "./page.css";

export default function Page() {
    const mockData = [
        { rank: 1, name: "Alice", score: 1200 },
        { rank: 2, name: "Bob", score: 1100 },
        { rank: 3, name: "Charlie", score: 1000 },
    ];

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
                {mockData.map((entry) => (
                    <tr key={entry.rank}>
                        <td>{entry.rank}</td>
                        <td>{entry.name}</td>
                        <td>{entry.score}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}