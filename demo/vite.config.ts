import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@ht-rnd/bpmn-dmn-react-ui": path.resolve(
        __dirname,
        "../src/lib/index.ts"
      ),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  base: "/bpmn-dmn-react-ui",
  server: {
    open: "/bpmn-dmn-react-ui",
  },
});
