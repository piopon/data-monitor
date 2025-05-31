"use client";

import { useEffect, useState } from "react";
import { LoginContext } from "@/context/Contexts";

const LoginProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const userLogged = !!token;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return <LoginContext.Provider value={{ userLogged, token, login, logout }}>{children}</LoginContext.Provider>;
};

export default LoginProvider;
