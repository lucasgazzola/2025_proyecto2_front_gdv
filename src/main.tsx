import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

import { ToastContainer } from "react-toastify";

import App from "./App.tsx";
import "./index.css";
// import { StrictMode } from "react";

import { AuthProvider } from "./contexts/providers/AuthContextProvider.tsx";
import { LanguageProvider } from "./contexts/providers/LanguageContextProvider.tsx";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <LanguageProvider>
        <App />
        <ToastContainer
          position="top-center"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </LanguageProvider>
    </AuthProvider>
  </BrowserRouter>
  // </StrictMode>
);
