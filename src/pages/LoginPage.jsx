import { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const userLogin = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("http://192.168.0.103:5000/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log(`Token: ${data.token}`);
    } catch (e) {
      console.error(`Error: ${e.message}`);
    }
  };

  return (
    <section id="login-section">
      <h2 className="login-title">Log in to your account</h2>
      <form className="login-form" onSubmit={userLogin}>
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
