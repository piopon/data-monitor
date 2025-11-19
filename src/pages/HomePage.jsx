"use client";

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginContext } from "@/context/Contexts";

export default function HomePage({ demo, error }) {
  const DEMO_USER_ID = 7357;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, logout } = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const userSave = async (userData) => {
    const getUserResponse = await fetch(`/api/user?email=${userData.email}`);
    const getUserData = await getUserResponse.json();
    if (!getUserResponse.ok) {
      return { id: undefined, message: getUserData.message };
    }
    if (getUserData.length > 1) {
      return { id: undefined, message: "Error: Received multiple user entries." };
    }
    const exists = getUserData.length === 1;
    const idFilter = exists ? `?id=${getUserData[0].id}` : ``;
    const addUserResponse = await fetch(`/api/user${idFilter}`, {
      method: exists ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const addUserData = await addUserResponse.json();
    if (!addUserResponse.ok) {
      return { id: undefined, message: addUserData.message };
    }
    return { id: addUserData.id, message: `User ${userData.email} saved.` };
  };

  const doLogin = async (userData, userStore) => {
    try {
      const response = await fetch("/api/scraper/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        logout();
        toast.error(data.error);
        return;
      }
      const saveResult = userStore
        ? await userSave({ email: email, jwt: data.token })
        : { id: DEMO_USER_ID, message: "Demo user = skip save operation!" };
      if (saveResult.id == null) {
        toast.error(saveResult.message);
        return;
      }
      login(saveResult.id, data);
      router.replace("/data");
      toast.success("Login successful!");
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const userLogin = async (event) => {
    event.preventDefault();
    await doLogin({email, password}, true);
  };

  const demoLogin = async (event) => {
    event.preventDefault();
    await doLogin({"demo-user": "user", "demo-pass": "pass"}, false);
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
        {demo && (
          <div className="demo-card">
            <form className="demo-form" onSubmit={demoLogin}>
              <input type="email" name="demo-user" value="" readOnly></input>
              <input type="password" name="demo-pass" value="" readOnly></input>
              <p>
                don't know if it's for you?
                <button type="submit" className="demo-submit">
                  see
                </button>
                how it works.
              </p>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
