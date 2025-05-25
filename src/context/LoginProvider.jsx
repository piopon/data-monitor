import { useState } from "react";
import { LoginContext } from "./Contexts";

const LoginProvider = ({ children }) => {
  const [userLogged, setUserLogged] = useState(() => !!localStorage.getItem("token"));

  const login = (token) => {
    localStorage.setItem("token", token);
    setUserLogged(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserLogged(false);
  };

  return <LoginContext.Provider value={{ userLogged, login, logout }}>{children}</LoginContext.Provider>;
};

export default LoginProvider;
