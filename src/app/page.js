"use client";

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginContext } from "@/context/Contexts";
import GuestAccess from "@/components/GuestAccess";
import { UserService } from "@/model/UserService";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, logout } = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await fetch("/api/init");
        if (!response.ok) {
          const err = await response.json();
          toast.error(err.message);
          return;
        }
      } catch (error) {
        toast.error(`Failed to get data: ${error.message}`);
      }
    };
    initialize();
  }, []);

  const userLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/scraper/token", {
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
      login(data);

      const users = await UserService.filterUsers({ email: email });
      if (users.length === 1) {
        UserService.editUser(users[0].id, { email: email, jwt: data.token });
      } else {
        UserService.addUser({ email: email, jwt: data.token });
      }

      router.replace("/data");
      toast.success("Login successful!");
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  return (
    <GuestAccess>
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
    </GuestAccess>
  );
}
