"use client";

import {Editor} from "@monaco-editor/react";
import React from "react";

export default function Home() {
  return (
      <div style={{
        flex: 1,
        height: "100%",
        marginRight: "10px",
        overflow: "hidden"
      }}>
          <Editor height="90vh" defaultLanguage="javascript" defaultValue="// some comment" />
      </div>
  );
}
