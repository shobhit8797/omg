import { ThemeProvider } from "@/components/theme-provider";
import "@/globals.css";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SignInForm } from "./components/Auth/LoginForm";
import Main from "./components/Main";
import { NavBar } from "./components/NavBar";
import { SignUpForm } from "./components/Auth/SignUpForm";
import { Lobby } from "./components/VideoChat/Lobby";

const App: React.FC = () => {
    const isAuthenticated = localStorage.getItem("token") ? true : false;

    return (
        <>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <div className="flex w-full flex-col h-screen">
                    {isAuthenticated ? <NavBar /> : null}

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

                            <Route
                                path="/lobby"
                                element={
                                    isAuthenticated ? (
                                        <Lobby />
                                    ) : (
                                        <Navigate to="/signin" replace />
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
