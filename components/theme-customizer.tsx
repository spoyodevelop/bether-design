"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";

type Palette = {
  name: string;
  primary: {
    light: string;
    dark: string;
  };
  secondary: {
    light: string;
    dark: string;
  };
};

const palettes: Palette[] = [
  {
    name: "Default",
    primary: {
      light: "217.2 91.2% 59.8%",
      dark: "217.2 91.2% 59.8%",
    },
    secondary: {
      light: "228 9% 92.2%",
      dark: "228 9% 14.9%",
    },
  },
  {
    name: "Mint",
    primary: {
      light: "160 60% 45%",
      dark: "160 70% 50%",
    },
    secondary: {
      light: "160 20% 90%",
      dark: "160 10% 20%",
    },
  },
  {
    name: "Sunset",
    primary: {
      light: "30 80% 55%",
      dark: "30 90% 60%",
    },
    secondary: {
      light: "20 30% 92%",
      dark: "20 15% 22%",
    },
  },
  {
    name: "Ocean",
    primary: {
      light: "205 80% 55%",
      dark: "205 90% 65%",
    },
    secondary: {
      light: "190 20% 90%",
      dark: "190 15% 20%",
    },
  },
  {
    name: "Plum",
    primary: {
      light: "260 70% 60%",
      dark: "260 80% 70%",
    },
    secondary: {
      light: "300 20% 92%",
      dark: "270 10% 22%",
    },
  },
  {
    name: "Emerald",
    primary: {
      light: "145 65% 50%",
      dark: "145 75% 60%",
    },
    secondary: {
      light: "150 20% 90%",
      dark: "150 15% 20%",
    },
  },
  {
    name: "Ruby",
    primary: {
      light: "340 85% 60%",
      dark: "340 90% 70%",
    },
    secondary: {
      light: "345 25% 92%",
      dark: "345 15% 22%",
    },
  },
  {
    name: "Amber",
    primary: {
      light: "35 90% 55%",
      dark: "40 95% 65%",
    },
    secondary: {
      light: "45 30% 90%",
      dark: "45 20% 20%",
    },
  },
  {
    name: "Sapphire",
    primary: {
      light: "210 80% 55%",
      dark: "210 90% 65%",
    },
    secondary: {
      light: "215 30% 90%",
      dark: "215 15% 20%",
    },
  },
  {
    name: "Jade",
    primary: {
      light: "165 60% 45%",
      dark: "165 70% 55%",
    },
    secondary: {
      light: "170 20% 90%",
      dark: "170 10% 20%",
    },
  },
  {
    name: "Garnet",
    primary: {
      light: "350 70% 55%",
      dark: "350 80% 65%",
    },
    secondary: {
      light: "355 20% 92%",
      dark: "355 10% 22%",
    },
  },
];

export function ThemeCustomizer() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [currentPalette, setCurrentPalette] = React.useState(palettes[0]);

  React.useEffect(() => {
    const root = document.documentElement;

    if (resolvedTheme === "dark") {
      root.style.setProperty("--primary", currentPalette.primary.dark);
      root.style.setProperty("--secondary", currentPalette.secondary.dark);
    } else {
      root.style.setProperty("--primary", currentPalette.primary.light);
      root.style.setProperty("--secondary", currentPalette.secondary.light);
    }
  }, [currentPalette, resolvedTheme]);

  const handlePaletteChange = (paletteName: string) => {
    const palette = palettes.find((p) => p.name === paletteName);
    if (palette) {
      setCurrentPalette(palette);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Colors</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {palettes.map((palette) => (
            <DropdownMenuItem
              key={palette.name}
              onClick={() => handlePaletteChange(palette.name)}
            >
              {palette.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
