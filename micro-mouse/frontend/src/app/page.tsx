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
        <Editor
            height="100%"
            width="100%"
            defaultLanguage=""
            defaultValue="// Start coding here..."
            theme="vs-dark"
            onMount={(editor, monaco) => (editor)}
        />
      </div>
  );
}
