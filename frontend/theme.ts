import { createTheme, MantineColorsTuple } from "@mantine/core";

// Define custom colors matching the current Tailwind neutral theme
const neutral: MantineColorsTuple = [
  "#f5f5f5", // 50 (approx)
  "#e5e5e5", // 100
  "#d4d4d4", // 200
  "#a3a3a3", // 300
  "#737373", // 400
  "#525252", // 500
  "#404040", // 600
  "#262626", // 700
  "#171717", // 800 - Foreground default
  "#0a0a0a", // 950 - Background default
];

export const theme = createTheme({
  colors: {
    neutral,
  },
  primaryColor: "neutral",
  fontFamily: "var(--font-geist-sans), sans-serif",
  fontFamilyMonospace: "var(--font-geist-mono), monospace",
  defaultRadius: "md",
});
