"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {}
});

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme") ?? "dark";

    setTheme(saved);

    document.documentElement.classList.toggle(
      "dark",
      saved === "dark"
    );
  }, []);

 function toggleTheme() {
  const next = theme === "dark" ? "light" : "dark";

  const updateTheme = () => {
    setTheme(next);

    document.documentElement.classList.toggle(
      "dark",
      next === "dark"
    );

    localStorage.setItem("theme", next);
  };

  if ("startViewTransition" in document) {
    (document as any).startViewTransition(updateTheme);
  } else {
    updateTheme();
  }
}

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);