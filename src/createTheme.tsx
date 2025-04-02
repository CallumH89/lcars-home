import type { Theme } from "theme-ui";

export const theme: Theme = {
  colors: {
    text: "#fff",
    background: "#000",
    primary: "#fff",
    secondary: "#ccc",
    accent: "#609",
    muted: "#666",
  },
  fonts: {
    body: "system-ui, sans-serif",
    heading: "system-ui, sans-serif",
    monospace: "Menlo, monospace",
  },
  images: {
    avatar: {
      width: 200,
      height: "auto",
      backgroundColor: "muted",
      borderRadius: "100%",
      border: "3px solid",
      borderColor: "primary",
      marginX: "auto",
      display: "block",
    },
  },
  buttons: {
    primary: {
      minWidth: "200px",
      color: "background",
      paddingY: 3,
      bg: "primary",
      "&:hover": {
        cursor: "pointer",
        bg: "secondary",
      },
    },
    secondary: {
      color: "background",
      bg: "secondary",
    },
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
};
