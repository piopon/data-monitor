import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Application from "./components/Application.jsx";
import LoginProvider from "./context/LoginProvider.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoginProvider>
      <Application />
    </LoginProvider>
  </StrictMode>
);
