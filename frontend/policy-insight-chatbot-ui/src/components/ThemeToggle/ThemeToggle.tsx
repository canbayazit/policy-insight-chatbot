import { useEffect, useState } from "react";

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(getInitialDark);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // follow system changes if user hasn't clicked yet
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return; 
    const handler = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem("theme");
      if (!saved) setDark(e.matches);
    };
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="p-2 rounded-full flex hover:bg-black/5 dark:hover:bg-white/10
      text-black/60 dark:text-white/70 focus:outline-none focus:ring-2 
      focus:ring-[var(--color-accent)]/40  md:text-2xl"
      title={dark ? "Aydınlık moda geç" : "Karanlık moda geç"}
      aria-label="Tema değiştir"
    >
      <span className="material-symbols-outlined icon-2xl">
        {dark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
