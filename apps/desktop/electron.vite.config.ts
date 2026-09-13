import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import path from "path";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, "main/index.ts"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, "preload/index.ts"),
      },
    },
  },
  renderer: {
    root: path.resolve(__dirname, "renderer"),
    build: {
      rollupOptions: {
        input: path.resolve(__dirname, "renderer/index.html"),
      },
    },
  },
});
