import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <section id="login-section">
      <h2 className="login-title">Log in to your account</h2>
      <form className="login-form">
        <div>
          <div className="login-field-div">
            <input
              required
              type="email"
              placeholder="email"
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
    </section>
  );
};

export default LoginPage;
