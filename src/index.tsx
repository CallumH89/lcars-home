import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeUIProvider } from "theme-ui";
import { theme } from "./createTheme.tsx";
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ThemeUIProvider theme={theme}>
      <App />
    </ThemeUIProvider>
  </React.StrictMode>,
);
