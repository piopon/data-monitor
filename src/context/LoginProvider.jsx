"use client";

import { useEffect, useState } from "react";
import { LoginContext } from "@/context/Contexts";

const LoginProvider = ({ children }) => {
  const DEMO_USER_ID = 7357;

  const [id, setId] = useState(-1);
  const [challenge, setChallenge] = useState(null);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const isDemo = DEMO_USER_ID === id;
  const userLogged = authReady && !!token;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    setAuthReady(true);
  }, []);

  const login = (id, email, data) => {
    setId(id);
    setEmail(email);
    setChallenge(data.challenge);
    setToken(data.token);
    localStorage.setItem("id", id);
    localStorage.setItem("token", data.token);
  };

  const demo = (data) => login(DEMO_USER_ID, null, data);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setToken(null);
    setChallenge(null);
    setEmail(null);
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
