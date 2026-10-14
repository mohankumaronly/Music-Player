import { Moon, Sun } from "lucide-react";
import { useUIStore } from "../../store/uiStore";
import { Button } from "./Button";

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme);
  const toggle = useUIStore((s) => s.toggleTheme);
  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-9 w-9 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}