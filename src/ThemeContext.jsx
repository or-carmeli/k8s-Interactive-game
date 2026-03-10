import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const t = localStorage.getItem("kq_theme");
      return t === "light" ? "light" : "dark";
    } catch { return "dark"; }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // Update theme-color meta tag for mobile browsers
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "light" ? "#f0f4f8" : "#020817";
    try { localStorage.setItem("kq_theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
