import { createTheme, MantineColorsTuple } from "@mantine/core";

// Define custom colors - pure grayscale
const neutral: MantineColorsTuple = [
  "#f5f5f5", // 50
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

  // Typography
  fontFamily: "NanumMyeongjo, serif",
  fontFamilyMonospace: "NanumMyeongjo, serif",

  // Typography scaling
  fontSizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
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
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },

  // Border radius scale
  radius: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },

  defaultRadius: "md",

  // Component styles
  components: {
    Button: {
      defaultProps: {
        size: "md",
      },
      styles: {
        root: {
          fontWeight: 500,
          letterSpacing: "0.02em",
          transition: "border-color 0.2s ease-in-out",
        },
      },
    },

    TextInput: {
      defaultProps: {
        size: "md",
      },
      styles: {
        input: {
          transition: "border-color 0.2s ease-in-out",
          "&:focus": {
            borderColor: "var(--mantine-color-neutral-4)",
          },
        },
      },
    },

    Paper: {
      styles: {
        root: {
          transition: "border-color 0.2s ease-in-out",
        },
      },
    },

    Anchor: {
      styles: {
        root: {
          transition: "color 0.2s ease-in-out",
          "&:hover": {
            color: "var(--mantine-color-neutral-2)",
          },
        },
      },
    },

    Title: {
      styles: {
        root: {
          letterSpacing: "-0.01em",
          fontWeight: 600,
        },
      },
    },

    Text: {
      styles: {
        root: {
          lineHeight: "1.6",
        },
      },
    },
  },
});
