import { createTheme, MantineColorsTuple } from "@mantine/core";

// Define custom colors - neutral base with accent accent
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

// Accent color - subtle blue for interactive elements
const accent: MantineColorsTuple = [
  "#e8f4ff", // 50
  "#d0e8ff", // 100
  "#a8d8ff", // 200
  "#7fc7ff", // 300
  "#5ab8ff", // 400
  "#3b9eec", // 500 - Primary accent
  "#2e82d0", // 600
  "#2169b3", // 700
  "#1751a3", // 800
  "#0f3a8a", // 900
];

export const theme = createTheme({
  colors: {
    neutral,
    accent,
  },
  primaryColor: "neutral",

  // Typography
  fontFamily: "NanumMyeongjo, serif",
  fontFamilyMonospace: "NanumMyeongjo, serif",

  // Typography scaling
  fontSizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    md: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
  },

  // Line heights for better readability
  lineHeights: {
    xs: "1.4",
    sm: "1.45",
    md: "1.5",
    lg: "1.6",
    xl: "1.7",
  },

  // Spacing scale
  spacing: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
  },

  // Border radius scale
  radius: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
  },

  defaultRadius: "md",

  // Button styles
  components: {
    Button: {
      defaultProps: {
        size: "md",
      },
      styles: {
        root: {
          fontWeight: 500,
          letterSpacing: "0.02em",
          transition: "all 0.2s ease-in-out",

          "&:hover": {
            transform: "translateY(-1px)",
          },

          "&:active": {
            transform: "translateY(0)",
          },
        },
      },
    },

    // Text input styles
    TextInput: {
      defaultProps: {
        size: "md",
      },
      styles: {
        input: {
          transition: "all 0.2s ease-in-out",

          "&:focus": {
            borderColor: "var(--mantine-color-accent-5)",
            boxShadow: "0 0 0 2px rgba(58, 158, 236, 0.1)",
          },
        },
      },
    },

    // Paper/Card styles
    Paper: {
      styles: {
        root: {
          transition: "all 0.2s ease-in-out",
        },
      },
    },

    // Anchor/Link styles
    Anchor: {
      styles: {
        root: {
          transition: "color 0.2s ease-in-out",

          "&:hover": {
            color: "var(--mantine-color-accent-5)",
          },
        },
      },
    },

    // Title styles
    Title: {
      styles: {
        root: {
          letterSpacing: "-0.01em",
          fontWeight: 600,
        },
      },
    },

    // Text styles
    Text: {
      styles: {
        root: {
          lineHeight: "1.6",
        },
      },
    },
  },

  // Global styles
  other: {
    // Custom shadows for depth
    shadowElevationOne: "0 1px 2px rgba(0, 0, 0, 0.3)",
    shadowElevationTwo: "0 3px 8px rgba(0, 0, 0, 0.3)",
    shadowElevationThree: "0 8px 16px rgba(0, 0, 0, 0.3)",
  },
});
