import { StrictMode } from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App.jsx";

import {
  SocProvider,
} from "./context/SocContext.jsx";

import "./styles/dashboard.css";


createRoot(
  document.getElementById("root")
).render(
  <StrictMode>

    <BrowserRouter>

      <SocProvider>

        <App />

      </SocProvider>

    </BrowserRouter>

  </StrictMode>
);
