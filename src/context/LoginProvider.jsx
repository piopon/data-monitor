"use client";

import { useEffect, useState } from "react";
import { LoginContext } from "@/context/Contexts";

const LoginProvider = ({ children }) => {
  const [id, setId] = useState(-1);
  const [challenge, setChallenge] = useState(null);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const userLogged = authReady && !!token;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    const storedDemo = localStorage.getItem("isDemo");
    setIsDemo(storedDemo === "true");
    setAuthReady(true);
  }, []);

  const login = (id, email, data, demoSession = false) => {
    setId(id);
    setEmail(email);
    setChallenge(data.challenge);
    setToken(data.token);
    setIsDemo(demoSession);
    localStorage.setItem("id", id);
    localStorage.setItem("token", data.token);
    localStorage.setItem("isDemo", demoSession ? "true" : "false");
  };

  const demo = (id, email, data) => login(id, email, data, true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    localStorage.removeItem("isDemo");
    setToken(null);
    setChallenge(null);
    setEmail(null);
    setIsDemo(false);
    setId(-1);
  };

  const userId = () => {
    if (id !== -1) {
      return id;
    }
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem("id");
  };

  return (
    <LoginContext.Provider value={{ authReady, userLogged, token, challenge, login, logout, demo, isDemo, userId, email }}>
      {children}
    </LoginContext.Provider>
  );
};

export default LoginProvider;
