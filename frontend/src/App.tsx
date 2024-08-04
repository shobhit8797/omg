import { ThemeProvider } from "@/components/theme-provider";
import "@/globals.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Main } from "./components/Main";

const App: React.FC = () => {
  return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Main />} />
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
  );
};

export default App;
