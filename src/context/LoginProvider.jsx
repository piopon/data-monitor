import { LoginContext } from "./Contexts";

const LoginProvider = ({ children }) => {
  const login = (token) => {
    localStorage.setItem("token", token);
  };

  const logout = () => {
    localStorage.removeItem("token");
  };

  return (
    <LoginContext.Provider value={{ login, logout }}>
      {children}
    </LoginContext.Provider>
  );
}

export default LoginProvider