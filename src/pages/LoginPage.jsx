import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../context/Contexts";
import { toast } from "react-toastify";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, logout } = useContext(LoginContext);

  const userLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/scraper/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        logout();
        toast.error(data.error);
        return;
      }
      login(data.token);
      navigate("/data");
      toast.success("Login successful!");
    } catch (e) {
      console.error(`Error: ${e.message}`);
    }
  };

  return (
    <section id="login-section">
      <div className="login-card">
        <h2 className="login-title">Log in to your account</h2>
        <form className="login-form" onSubmit={userLogin}>
          <div>
            <div className="login-field-div">
              <input
                required
                type="email"
                placeholder="email"
                autoComplete="email"
                className="login-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="login-field-div">
              <input
                required
                type="password"
                placeholder="password"
                autoComplete="current-password"
                className="login-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login-submit-div">
              <button type="submit" className="login-submit">
                login
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default LoginPage;
