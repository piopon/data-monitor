"use client";

import { useEffect, useState } from "react";
import { LoginContext } from "@/context/Contexts";

const LoginProvider = ({ children }) => {
  const DEMO_USER_ID = 7357;

  const [userId, setUserId] = useState(-1);
  const [challenge, setChallenge] = useState(null);
  const [token, setToken] = useState(null);
  const isDemo = DEMO_USER_ID === userId;
  const userLogged = !!token;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  const login = (id, data) => {
    setUserId(id);
    setChallenge(data.challenge);
    setToken(data.token);
    localStorage.setItem("token", data.token);
  };

  const demo = (data) => login(DEMO_USER_ID, data);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setChallenge(null);
    setUserId(-1);
  };

  return (
    <LoginContext.Provider value={{ userLogged, token, challenge, login, logout, demo, isDemo, userId }}>
      {children}
    </LoginContext.Provider>
  );
};

export default LoginProvider;
