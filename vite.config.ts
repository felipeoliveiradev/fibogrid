import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/fibogrid/' : '/';

  return {
    base,
    server: {
      host: "::",
      port: 8080,
      open: true,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "fibogrid": path.resolve(__dirname, "./src/index.ts"),
        "fibogrid/styles.css": path.resolve(__dirname, "./src/fibogrid-lib.css"),
        "fibogrid/types": path.resolve(__dirname, "./src/components/FiboGrid/types.ts"),
        "fibogrid/utils/excelExport": path.resolve(__dirname, "./src/components/FiboGrid/utils/excelExport.ts"),
      },
    },
  };
});
