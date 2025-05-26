"use client";

import { Editor } from "@monaco-editor/react";
import React, { useEffect, useRef, useState, useCallback } from "react";
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

interface RunResult {
    steps: Position[];
    instruction_count: number;
    output: string;
}

interface GeneratorResponse{
    maze: number[][];
    seed: string;
}

const drawMaze = (ctx: CanvasRenderingContext2D, maze: number[][], cellSize: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    maze.forEach((row, i) => {
        row.forEach((cell, j) => {
            ctx.fillStyle = cell === 1 ? "#fff" : "#23272f";
            ctx.fillStyle = cell === 2 ? "#43e97b" : ctx.fillStyle;
            ctx.fillStyle = cell === 3 ? "#ff5858" : ctx.fillStyle;
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
    const [mazeData, setMazeData] = useState<number[][] | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const isRunningRef = useRef(isRunning);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [consoleOutput, setConsoleOutput] = useState<string>("Console output will appear here...");
    const [currentSeed, setCurrentSeed] = useState<string>("");

    useEffect(() => {
        isRunningRef.current = isRunning;
    }, [isRunning]);

    const initializeMaze = useCallback(async () => {
        const url = `http://localhost:3001/api/maze/generate-maze?width=${cols}&height=${rows}`;
        const response = await fetch(url);
        const data = await response.json() as GeneratorResponse;
        setMazeData(data.maze);
        setCurrentSeed(data.seed);
    }, [cols, rows]);

    const fetchMaze = useCallback(async () => {
        let url;
        if (currentSeed.trim() === "") {
            url = `http://localhost:3001/api/maze/generate-maze?width=${cols}&height=${rows}`;
        } else {
            url = `http://localhost:3001/api/maze/generate-maze-seed?width=${cols}&height=${rows}&seed=${currentSeed}`;
        }

        const response = await fetch(url);
        const data = await response.json() as GeneratorResponse;
        setMazeData(data.maze);
        if (currentSeed.trim() === "") {
            setCurrentSeed(data.seed);
        }
    }, [cols, rows, currentSeed]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

        const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: typeof monaco) => {
            editorRef.current = editor;


            monacoInstance.languages.register({ id: "customLang" });


            monacoInstance.languages.setMonarchTokensProvider("customLang", {
                tokenizer: {
                    root: [
                        [/\b(func|if|while|return|int|float|bool|void|true|false)\b/, "keyword"],
                        [/\b(move_forward|turn_left|turn_right|teleport|is_wall|next_wall)\b/, "builtin"],
                        [/\b\d+\.\d+\b/, "float"],
                        [/\b\d+\b/, "integer"],
                        [/\b[a-zA-Z][a-zA-Z0-9_]*\b/, "identifier"],
                        [/(\|\||&&|==|!=|<=|>=|[<>+\-*\/%=!])/, "operator"],
                        [/[{}[\](),;]/, "delimiter"],
                        [/\/\/.*$/, "comment"],
                        [/\/\*/, "comment", "@comment"],
                        [/\s+/, "whitespace"],
                    ],
                    comment: [
                        [/[^\/*]+/, "comment"],
                        [/\*\//, "comment", "@pop"],
                        [/[\/*]/, "comment"]
                    ],
                },
            });

            monacoInstance.languages.setLanguageConfiguration("customLang", {
                comments: {
                    lineComment: "//",
                    blockComment: ["/*", "*/"]
                },
                brackets: [
                    ["{", "}"],
                    ["[", "]"],
                    ["(", ")"]
                ],
                autoClosingPairs: [
                    { open: "{", close: "}" },
                    { open: "[", close: "]" },
                    { open: "(", close: ")" },
                    { open: '"', close: '"' },
                    { open: "'", close: "'" }
                ],
                surroundingPairs: [
                    { open: "{", close: "}" },
                    { open: "[", close: "]" },
                    { open: "(", close: ")" },
                    { open: '"', close: '"' },
                    { open: "'", close: "'" }
                ]
            });


            monacoInstance.editor.defineTheme("micromouseTheme", {
                base: "vs-dark",
                inherit: true,
                rules: [
                    { token: "keyword", foreground: "#43e97b"},
                    { token: "builtin", foreground: "#2196f3" },
                    { token: "integer", foreground: "#f09819" },
                    { token: "float", foreground: "#f09819" },
                    { token: "identifier", foreground: "#21cbf3" },
                    { token: "operator", foreground: "#ff5858" },
                    { token: "delimiter", foreground: "#f5f6fa" },
                    { token: "comment", foreground: "#6b7280" },
                ],
                colors: {
                    "editor.background": "#1a1d22",
                    "editor.foreground": "#f5f6fa",
                    "editorCursor.foreground": "#43e97b",
                    "editor.lineHighlightBackground": "#2f353e",
                    "editor.selectionBackground": "#3a3f45",
                    "editor.inactiveSelectionBackground": "#2f353e"
                }
            });

            monacoInstance.editor.setTheme("micromouseTheme");
        };

    const runProgram = async () => {
        if (editorRef.current) {
            const code = editorRef.current.getValue();
            const response = await fetch("http://localhost:3001/api/compiler/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, maze: mazeData }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                setConsoleOutput(errorText);
                return;
            }

            const result = JSON.parse(await response.json()) as RunResult;
            setConsoleOutput("Running program..." + result.output);
            setIsRunning(true);
            isRunningRef.current = true;

            if (result.steps.length > 0) {
                autoStep(result,  1, mazeData!.map(x => x.slice()));
            }
        }
    };

    const autoStep = async (result: RunResult, stepIdx: number, cur_maze: number[][]) => {
        const stepsArr = result.steps;
        if (!isRunningRef.current || stepIdx >= stepsArr.length) {
            setIsRunning(false);
            return;
        }

        const pos = stepsArr[stepIdx];
        const lastPos = stepsArr[stepIdx - 1];
        cur_maze[pos.y][pos.x] = 2;
        cur_maze[lastPos.y][lastPos.x] = 0;

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
                drawMaze(ctx, cur_maze, cellSize);
            }
        }

        if (stepIdx < stepsArr.length - 1 && isRunningRef.current) {
            timerRef.current = setTimeout(() => autoStep(result, stepIdx + 1, cur_maze), 100);
        } else {
            if(mazeData![pos.y][pos.x] !== 3) {
                timerRef.current = setTimeout(() => stopProgram(), 1500);
            } else {
                const token = localStorage.getItem("token");
                const currentTime = new Date().toISOString().slice(0, 19);

                await fetch("http://localhost:3001/api/leaderboard/add-score", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        username: localStorage.getItem("username"),
                        instructionCount: result.instruction_count,
                        seed: currentSeed,
                        time: currentTime
                    })
                });

                createFirework(result);
            }
        }
    };

    const createFirework = (result: RunResult) => {
        const canvas = document.createElement('canvas');
        canvas.className = 'firework';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d')!;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: Array<{x: number, y: number, vx: number, vy: number, color: string, size: number}> = [];
        const colors = ['#43e97b', '#2196f3', '#ff5858', '#f09819', '#38f9d7'];

        for (let i = 0; i < 2000; i++) {
            const angle = (Math.PI * 2 * i) / 100;
            const speed = Math.random() * 12 + 2;
            particles.push({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 5 + 2
            });
        }

        const popup = document.createElement('div');
        popup.className = 'success-popup';
        popup.innerHTML = `
        <div style="position:relative;">
            <button style="position:absolute; right:-20px; top:-20px; background:none; border:none; color:white; font-size:20px; cursor:pointer;">✕</button>
            <h3 style="margin:0 0 10px 0;">Success! 🎉</h3>
            <p style="margin:0;">You successfully reached the target in ${result.instruction_count} instructions!</p>
        </div>
    `;
        document.body.appendChild(popup);

        const closeButton = popup.querySelector('button');
        closeButton?.addEventListener('click', () => {
            document.body.removeChild(canvas);
            document.body.removeChild(popup);
            stopProgram();
        });

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });

            if (canvas.style.opacity !== '0') {
                requestAnimationFrame(animate);
            }
        };

        animate();
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
                drawMaze(ctx, mazeData!, cellSize);
            }
        }
    };

    useEffect(() => {
        if (mazeData && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const cellSize = Math.min(canvas.width / cols, canvas.height / rows);
                drawMaze(ctx, mazeData, cellSize);
            }
        }
    }, [mazeData]);

    useEffect(() => {
        const initializeApp = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                setIsLoggedIn(true);
                await initializeMaze();
            }
            setIsLoading(false);
        };

        initializeApp();
        document.title = "Micromouse";

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [initializeMaze]);

    if (isLoading) {
        return null;
    }

    return (
        <div id="main-layout">
            <div id="header">
                <span>Micromouse</span>
            </div>
            {!isLoggedIn ? (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
            ) : (
                <div id="content">
                    <div id="sidebar">
                        <button
                            className="sidebar-button logout-button"
                            onClick={handleLogout}
                            disabled={isRunning}
                            style={{ opacity: isRunning ? 0.5 : 1 }}
                        >
                            Logout
                        </button>
                        <button
                            className="sidebar-button generateButton"
                            onClick={fetchMaze}
                            disabled={isRunning}
                            style={{ opacity: isRunning ? 0.5 : 1 }}
                        >
                            Generate Maze
                        </button>
                        {isRunning ? (
                            <button className="sidebar-button runButton" onClick={stopProgram}>⏹ Stop</button>
                        ) : (
                            <button className="sidebar-button runButton" onClick={runProgram}>▶ Run Code</button>
                        )}
                        <button
                            className="sidebar-button leaderboardButton"
                            onClick={() => router.push("/leaderboard")}
                            disabled={isRunning}
                            style={{ opacity: isRunning ? 0.5 : 1 }}
                        >
                            Leaderboard
                        </button>
                    </div>
                    <div id="main">
                        <div className="card" id="editor-card">
                            <h2 style={{color: "#43e97b", fontWeight: 600}}>Code Editor</h2>
                            <Editor
                                height="calc(100% - 60px)"
                                width="100%"
                                defaultLanguage="customLang"
                                defaultValue={`func void main() {
    move_forward();
}`}
                                theme="vs-dark"
                                onMount={(editor, monaco) => handleEditorMount(editor, monaco)}
                            />
                        </div>
                        <div className="card" id="maze-card">
                            <div style={{
                                display: 'flex',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                            }}>
                                <h2 style={{ margin: 0, color: "#2196f3", fontWeight: 600 }}>Maze</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h2 style={{ margin: 0, color: "#2196f3", fontWeight: 600, fontSize: '1em' }}>
                                        Seed:
                                    </h2>
                                    <input
                                        type="text"
                                        value={currentSeed}
                                        onChange={(e) => setCurrentSeed(e.target.value)}
                                        disabled={isRunning}
                                        style={{
                                            background: '#1a1d22',
                                            border: '1px solid #2f353e',
                                            borderRadius: '6px',
                                            color: '#2196f3',
                                            padding: '4px 8px',
                                            fontSize: '1em',
                                            fontWeight: 600,
                                            width: '120px'
                                        }}
                                    />
                                </div>
                            </div>
                            <div id="maze-container">
                                <canvas ref={canvasRef} width={500} height={500} />
                            </div>
                            <div id="maze-console">
                                <pre style={{ color: consoleOutput.includes('error') ? '#ff5858' : consoleOutput.startsWith('Running') ? '#43e97b' : '#a0aec0'  }}>
                                    {consoleOutput}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}