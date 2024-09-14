import { ThemeProvider } from "@/components/theme-provider";
import "@/globals.css";
import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import { NavBar } from "./components/NavBar";
import { SignInForm } from "./components/LoginForm";
import { SignUpForm } from "./components/SignUpForm";

const App: React.FC = () => {
    const isAuthenticated = localStorage.getItem("token") ? true : false;

    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className="flex min-h-screen w-full flex-col">
                    {isAuthenticated ?  <NavBar /> : null}
                    
                    <BrowserRouter>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    isAuthenticated ? (
                                        <Main />
                                    ) : (
                                        <Navigate to="/signup" replace />
                                    )
                                }
                            />
                            <Route
                                path="/signin"
                                element={
                                    isAuthenticated ? (
                                        <Navigate to="/" replace />
                                    ) : (
                                        <SignInForm />
                                    )
                                }
                            />
                            <Route
                                path="/signup"
                                element={
                                    isAuthenticated ? (
                                        <Navigate to="/" replace />
                                    ) : (
                                        <SignUpForm />
                                    )
                                }
                            />
                        </Routes>
                    </BrowserRouter>
                </div>
            </ThemeProvider>
        </>
    );
};

export default App;
