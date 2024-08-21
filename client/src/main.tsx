import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" richColors />

      <App />
    </QueryClientProvider>
  </StrictMode>
);
