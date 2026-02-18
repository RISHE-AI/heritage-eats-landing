import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useThemeColor, type ThemeColor } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const THEME_COLORS: { value: ThemeColor; label: string; colorClass: string }[] = [
  { value: "warm-red", label: "Warm Red", colorClass: "bg-red-700" },
  { value: "royal-purple", label: "Royal Purple", colorClass: "bg-purple-700" },
  { value: "forest-green", label: "Forest Green", colorClass: "bg-emerald-700" },
  { value: "saffron-orange", label: "Saffron Orange", colorClass: "bg-orange-500" },
  { value: "deep-blue", label: "Deep Blue", colorClass: "bg-blue-700" },
];

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const { themeColor, setThemeColor } = useThemeColor();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setTheme("light")} className="gap-2">
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="gap-2">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="gap-2">
          <span className="text-sm">💻</span>
          <span>System</span>
          {theme === "system" && <span className="ml-auto text-primary">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5" />
          Accent Color
        </DropdownMenuLabel>
        <div className="flex items-center gap-1.5 px-2 py-2">
          {THEME_COLORS.map((tc) => (
            <button
              key={tc.value}
              onClick={() => setThemeColor(tc.value)}
              className={cn(
                "h-7 w-7 rounded-full transition-all duration-200 hover:scale-110",
                tc.colorClass,
                themeColor === tc.value
                  ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                  : "opacity-70 hover:opacity-100"
              )}
              title={tc.label}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
