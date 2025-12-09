import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "../node_modules/fibogrid/dist/style.css";
import "./fibogrid.css"; // Use local CSS for documentation site

// Initialize theme from localStorage or system preference
const initTheme = () => {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (stored === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
};

initTheme();

createRoot(document.getElementById("root")!).render(<App />);
