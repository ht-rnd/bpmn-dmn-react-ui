import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import bundleCss from "vite-plugin-bundle-css";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
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
    setupFiles: ["src/tests/setup.ts"],
    css: true,
    reporters: ["verbose", "junit"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html", "cobertura"],
      include: ["src/tests/**"],
      exclude: ["src/stories/**", "src/lib/**"],
    },
  },
});
