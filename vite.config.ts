import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  // Determine base path based on mode
  // Development: use '/' for local development (bun run dev)
  // Production: use '/fibogrid/' for GitHub Pages
  const base = mode === 'production' ? '/fibogrid/' : '/';

  return {
    base,
    server: {
      host: "::",
      port: 8080,
      open: true, // Auto-open browser on dev server start
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // During development, alias 'fibogrid' to local source code
        // This allows importing 'fibogrid' without building the package first
        "fibogrid": path.resolve(__dirname, "./src/index.ts"),
        "fibogrid/styles.css": path.resolve(__dirname, "./src/fibogrid-lib.css"),
        "fibogrid/types": path.resolve(__dirname, "./src/components/FiboGrid/types.ts"),
        "fibogrid/utils/excelExport": path.resolve(__dirname, "./src/components/FiboGrid/utils/excelExport.ts"),
      },
    },
  };
});
