"use client";

import { Editor } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import "./page.css";
import { useRouter } from "next/navigation";
import Login from "./components/Login/Login";
import type monaco from "monaco-editor";

interface Position {
    x: number;
    y: number;
    dir_x: number;
    dir_y: number;
}

const drawMaze = (ctx: CanvasRenderingContext2D, maze: number[][], cellSize: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    maze.forEach((row, i) => {
        row.forEach((cell, j) => {
            ctx.fillStyle = cell === 1 ? "#fff" : "#000";
            ctx.fillStyle = cell === 2 ? "#00ff00" : ctx.fillStyle;
            ctx.fillStyle = cell === 3 ? "#f00" : ctx.fillStyle;
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        });
    });
};

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cols = 31;
    const rows = 31;
    const router = useRouter();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [maze, setMaze] = useState<number[][]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const isRunningRef = useRef(isRunning);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    const fetchAndDrawMaze = async () => {
        const response = await fetch(`http://localhost:3001/api/maze/generate-maze?width=${cols}&height=${rows}`);
        const data = await response.json() as number[][];
        setMaze(data);

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
                drawMaze(ctx, data, cellSize);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
        editorRef.current = editor;
    };

    const runProgram = async () => {
        if (editorRef.current) {
            const code = editorRef.current.getValue();

            const response = await fetch("http://localhost:3001/api/compiler/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, maze }),
            });

            const result = JSON.parse(await response.json()) as Position[];
            setIsRunning(true);
            isRunningRef.current = true;
            console.log(result);

            if (result.length > 0) {
                autoStep(result, 1, maze.map(x => x.slice()));
            }
        }
    };

    const autoStep = (stepsArr: Position[], stepIdx: number, maze: number[][]) => {
        if (!isRunningRef.current || stepIdx >= stepsArr.length) {
            setIsRunning(false);
            return;
        }

        const pos = stepsArr[stepIdx];
        const lastPos = stepsArr[stepIdx - 1];
        maze[pos.y][pos.x] = 2;
        maze[lastPos.y][lastPos.x] = 0;

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
                drawMaze(ctx, maze, cellSize);
            }
        }

        if (stepIdx < stepsArr.length - 1 && isRunningRef.current) {
            timerRef.current = setTimeout(() => autoStep(stepsArr, stepIdx + 1, maze), 1500);
        } else {
            timerRef.current = setTimeout(() => stopProgram(), 1500);
        }
    };

    const stopProgram = () => {
        setIsRunning(false);
        isRunningRef.current = false;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
                drawMaze(ctx, maze, cellSize);
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
        // Cleanup on unmount
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <div>
            {!isLoggedIn ? (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
            ) : (
                <div style={{ display: "flex", flexDirection: "row", height: "98vh" }}>
                    <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                    <div style={{ flex: 1, marginRight: "10px", overflow: "hidden" }}>
                        <Editor
                            height="100%"
                            width="100%"
                            defaultLanguage=""
                            defaultValue="#Start coding here..."
                            theme="vs-dark"
                            onMount={(editor, monaco) => handleEditorMount(editor, monaco)}
                        />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                        <canvas ref={canvasRef} width={500} height={500} />
                        <div style={{ flex: 1, display: "flex", flexDirection: "row", height: "100%", overflow: "hidden" }}>
                            <button className="generateButton" onClick={fetchAndDrawMaze}>
                                Neues Labyrinth generieren
                            </button>
                            {isRunning ? (
                                <button className="runButton" onClick={stopProgram}>⏹ Stop</button>
                            ) : (
                                <button className="runButton" onClick={runProgram}>▶ Run Code</button>
                            )}
                            <button className="leaderboardButton" onClick={() => router.push("/leaderboard")}>
                                Zum Leaderboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}