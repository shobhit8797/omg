import { ThemeProvider } from "@/components/theme-provider";
import "@/globals.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Main } from "./components/Main";
import { NavBar } from "./components/NavBar";

const App: React.FC = () => {
  return (
      <>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              {/* <div className="flex flex-col h-screen"> */}
              <div className="flex min-h-screen w-full flex-col">
                  {/* <div className="h-[5%]"> */}
                      {/* <ModeToggle /> */}
                      <NavBar />
                  {/* </div> */}
                  {/* <div className="h-[95%]"> */}
                      <BrowserRouter>
                          <Routes>
                              <Route path="/" element={<Main />} />
                              {/* <Route path="/" element={<Landing />} /> */}
                          </Routes>
                      </BrowserRouter>
                  </div>
              {/* </div> */}
          </ThemeProvider>
      </>
  );
};

export default App;
