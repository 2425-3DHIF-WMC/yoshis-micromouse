"use client";

import {Editor} from "@monaco-editor/react";
import React, {useEffect, useRef, useState} from "react";
import "./page.css";

const generateMaze = (rows: number, cols: number) => {
    const maze = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            maze[i][j] = Math.random() > 0.5 ? 1 : 0;
        }
    }
    return maze;
};

const drawMaze = (ctx: CanvasRenderingContext2D, maze: number[][], cellSize: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            ctx.fillStyle = maze[i][j] === 1 ? "#000" : "#fff";
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
};

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [maze, setMaze] = useState<number[][]>([]);
    const rows = 16;
    const cols = 16;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const cellSize = canvas.width / cols;
                drawMaze(ctx, maze, cellSize);
            }
        }
    }, [maze]);

    useEffect(() => {
        setMaze(generateMaze(rows, cols));
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "row", height: "98vh" }}>
            <div style={{ flex: 1, marginRight: "10px", overflow: "hidden" }}>
                <Editor height="100%" defaultLanguage="typescript" defaultValue="// some comment" />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                <canvas ref={canvasRef} width="100%" height="95%" />
                <button style={{ height: "5%" }}>▶ Run Code</button>
            </div>
        </div>
    );
}
