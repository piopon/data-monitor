"use client";

import { useEffect, useState } from "react";
import { LoginContext } from "@/context/Contexts";

const LoginProvider = ({ children }) => {
  const DEMO_USER_ID = 7357;

  const [id, setId] = useState(-1);
  const [challenge, setChallenge] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setToken(token);
    }
  }, []);

  const login = (id, data) => {
    setId(id);
    setChallenge(data.challenge);
    setToken(data.token);
    localStorage.setItem("id", id);
    localStorage.setItem("token", data.token);
  };

  const demo = (data) => login(DEMO_USER_ID, data);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("id");
    setToken(null);
    setChallenge(null);
    setId(-1);
  };

  const userId = () => {
    return id === -1 ? localStorage.getItem("id") : id;
  };

  const isDemo = DEMO_USER_ID === userId();
  const userLogged = !!token;

  return (
    <LoginContext.Provider value={{ userLogged, token, challenge, login, logout, demo, isDemo, userId }}>
      {children}
    </LoginContext.Provider>
  );
};

export default LoginProvider;
