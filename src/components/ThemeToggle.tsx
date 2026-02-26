import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { currentTheme, setTheme, allThemes } = useTheme();

  const lightThemes = allThemes.filter((t) => !t.isDark);
  const darkThemes = allThemes.filter((t) => t.isDark);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Change Theme">
          <Palette className="h-[1.15rem] w-[1.15rem]" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          ☀️ Light Themes
        </DropdownMenuLabel>
        {lightThemes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn("gap-3 cursor-pointer", currentTheme === t.id && "bg-primary/10")}
          >
            <div
              className="h-5 w-5 rounded-full border-2 border-white shadow-sm shrink-0"
              style={{ backgroundColor: t.preview }}
            />
            <span className="flex-1">
              {t.emoji} {t.name}
            </span>
            {currentTheme === t.id && <Check className="h-4 w-4 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          🌙 Dark Themes
        </DropdownMenuLabel>
        {darkThemes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn("gap-3 cursor-pointer", currentTheme === t.id && "bg-primary/10")}
          >
            <div
              className="h-5 w-5 rounded-full border-2 border-white shadow-sm shrink-0"
              style={{ backgroundColor: t.preview }}
            />
            <span className="flex-1">
              {t.emoji} {t.name}
            </span>
            {currentTheme === t.id && <Check className="h-4 w-4 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
