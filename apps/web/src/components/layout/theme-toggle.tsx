"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const enabled =
      stored === "dark" ||
      (!stored && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", enabled);
    setDark(enabled);
  }, []);
  function toggle() {
    const enabled = !dark;
    document.documentElement.classList.toggle("dark", enabled);
    localStorage.setItem("theme", enabled ? "dark" : "light");
    setDark(enabled);
  }
  return (
    <Button
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      onClick={toggle}
      size="icon"
      title={dark ? "Usar tema claro" : "Usar tema escuro"}
      type="button"
      variant="ghost"
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
}
