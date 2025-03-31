"use client";

import {Editor} from "@monaco-editor/react";
import React from "react";
import "./page.css";

export default function Home() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            height: "100%"
        }}>
            <div style={{
                flex: 1,
                height: "100%",
                marginRight: "10px",
                overflow: "hidden"
            }}>
                <Editor height="100vh" defaultLanguage="typescript" defaultValue="// some comment" />
            </div>
            <div style={{
                flex: 1,
                height: "100%",
                marginLeft: "10px",
                overflow: "hidden",
                gridRow: 16,
                gridColumn: 16
            }}>
            </div>
            <div>
                <button>
                    ▶ Run Code
                </button>
            </div>
        </div>
    );
}
