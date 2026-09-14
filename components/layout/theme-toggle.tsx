"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Props = { label: string; light: string; dark: string };

export function ThemeToggle({ label, light, dark }: Props) {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("textsafe-theme");
    const dark = stored === "dark" || (!stored && matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(dark);
    if (stored) document.documentElement.dataset.theme = stored;
  }, []);

  function toggle() {
    const next = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("textsafe-theme", next);
  }

  return (
    <button type="button" onClick={toggle} className="btn-secondary !p-2.5" aria-label={label} title={isDark ? light : dark}>
      {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
