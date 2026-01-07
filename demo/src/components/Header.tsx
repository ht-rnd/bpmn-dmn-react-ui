import { Link, useLocation } from "@tanstack/react-router";
import type { IHeaderProps } from "../interfaces/props";
import { Github, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function Header({ theme, onThemeChange }: IHeaderProps) {
  const location = useLocation();
  const isBpmn = location.pathname === "/bpmn";
  const isDmn = location.pathname === "/dmn";

  return (
    <div className="border-b border-input sticky top-0 p-4 px-16 flex items-center justify-between bg-background z-[1000]">
      <Link to="/" className="font-semibold text-lg">
        @ht-rnd/bpmn-dmn-react-ui
      </Link>

      <div className="flex gap-4">
        <Button variant={isBpmn ? "default" : "ghost"} asChild>
          <Link to="/bpmn">BPMN</Link>
        </Button>
        <Button variant={isDmn ? "default" : "ghost"} asChild>
          <Link to="/dmn">DMN</Link>
        </Button>
      </div>

      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </Button>
        <Button variant="outline" asChild>
          <a href="https://github.com/ht-rnd/bpmn-dmn-react-ui" target="_blank">
            <Github />
          </a>
        </Button>
      </div>
    </div>
  );
}
