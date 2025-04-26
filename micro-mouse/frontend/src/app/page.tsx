"use client";

import {Editor} from "@monaco-editor/react";
import React, {useEffect, useRef, useState} from "react";
import "./page.css";
import * as fs from 'fs';

const readMaze = () => {
    const files = ['maze00', 'maze01', 'maze02', 'maze03', 'maze04'];
    const mazeFile = files[Math.floor(Math.random() * 5)];
    const mazeText = fs.readFileSync(mazeFile, 'utf-8');
    const maze: number[][] = mazeText
        .trim()
        .split('\n')
        .map(line => line.trim().split('').map(Number));
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
        setMaze(readMaze());
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
