import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import { createRequire } from "node:module";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            fs: createRequire(import.meta.url).resolve(
                "rollup-plugin-node-builtins"
            ),
        },
    },
    define: {
        "process.env": process.env,
    },
});
