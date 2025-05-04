"use client";

import { Editor } from "@monaco-editor/react";
import React, { useEffect, useRef} from "react";
import "./page.css";
import { useRouter } from "next/navigation";

const drawMaze = (ctx: CanvasRenderingContext2D, maze: number[][], cellSize: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    maze.forEach((row, i) => {
        row.forEach((cell, j) => {
            ctx.fillStyle = cell === 1 ? "#fff" : "#000";
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        });
    });
};

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cols = 15;
    const rows = 15;
    const router = useRouter();

    const fetchAndDrawMaze = async () => {
        const response = await fetch(`http://localhost:3001/api/generate-maze?width=${cols}&height=${rows}`);
        const data = await response.json();

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
                drawMaze(ctx, data, cellSize);
            }
        }
    };

    useEffect(() => {
        fetchAndDrawMaze()
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "98vh" }}>
            <div style={{ flex: 1, marginRight: "10px", overflow: "hidden" }}>
                <Editor height="100%" defaultLanguage="typescript" defaultValue="// some comment" />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                <canvas ref={canvasRef} width={500} height={500} />
                <div style={{ flex: 1, display: "flex", flexDirection: "row", height: "100%", overflow: "hidden" }}>
                    <button className="generateButton" onClick={fetchAndDrawMaze}>
                        Neues Labyrinth generieren
                    </button>
                    <button className="runButton">▶ Run Code</button>
                    <button className="leaderboardButton" onClick={() => router.push("/leaderboard")}>
                        Zum Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
}