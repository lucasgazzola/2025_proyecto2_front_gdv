import { BrowserRouter } from "react-router";
import { createRoot } from "react-dom/client";

import { ToastContainer } from "react-toastify";

import App from "./App.tsx";
import "./index.css";

import { AuthProvider } from "./contexts/providers/AuthContextProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
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
    </AuthProvider>
  </BrowserRouter>
);
