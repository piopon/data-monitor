"use client";

import { useEffect, useState } from "react";
import { LoginContext } from "@/context/Contexts";

const LoginProvider = ({ children }) => {
  const [challenge, setChallenge] = useState(null);
  const [token, setToken] = useState(null);
  const userLogged = !!token;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  const login = (data) => {
    setChallenge(data.challenge);
    setToken(data.token);
    localStorage.setItem("token", data.token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setChallenge(null);
  };

  return <LoginContext.Provider value={{ userLogged, token, challenge, login, logout }}>{children}</LoginContext.Provider>;
};

export default LoginProvider;
