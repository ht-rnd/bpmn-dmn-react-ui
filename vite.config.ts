import { resolve } from "path";
import { defineConfig, type UserConfig } from "vite";
import dts from "vite-plugin-dts";
import bundleCss from "vite-plugin-bundle-css";
import react from "@vitejs/plugin-react";

const config: UserConfig & {
  test?: {
    globals?: boolean;
    environment?: string;
    setupFiles?: string;
    [key: string]: any;
  };
} = {
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      outDir: "dist/types",
      include: ["src/lib"],
      exclude: ["src/App.tsx", "src/main.tsx"],
    }),
    bundleCss({
      fileName: "styles.css",
      include: ["**/styles.css"],
      mode: "inline",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "bpmn-dmn-react-ui",
      formats: ["es", "umd"],
      fileName: (format) => `lib/main.${format}.js`,
    },
    outDir: "dist",
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true,
    reporters: ["verbose", "junit"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html", "cobertura"],
      include: ["src/lib/components"],
    },
  },
};

export default defineConfig(config);
