"use client";

import { useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginContext } from "@/context/Contexts";
import { RequestUtils } from "@/lib/RequestUtils";

export default function HomePage({ demoEnabled, initError }) {
  const DEMO_FALLBACK_EMAIL = "demo.user@data-monitor.local";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { demo, login, logout } = useContext(LoginContext);
  const router = useRouter();

  const getEmailFromJwt = (token) => {
    try {
      const payloadRaw = String(token).split(".")[1];
      if (!payloadRaw) {
        return null;
      }
      const payloadBase64 = payloadRaw.replace(/-/g, "+").replace(/_/g, "/");
      const json = atob(payloadBase64);
      const payload = JSON.parse(json);
      const jwtEmail = typeof payload?.email === "string" ? payload.email.trim() : "";
      return jwtEmail || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (initError) {
      toast.error(initError);
    }
  }, [initError]);

  const userSave = async (userData) => {
    const getUserResponse = await fetch(`/api/user?email=${userData.email}`);
    if (!getUserResponse.ok) {
      return { id: undefined, message: await RequestUtils.getResponseMessage(getUserResponse) };
    }
    const getUserData = await getUserResponse.json();
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
    if (!addUserResponse.ok) {
      return { id: undefined, message: await RequestUtils.getResponseMessage(addUserResponse) };
    }
    const addUserData = await addUserResponse.json();
    return { id: addUserData.id, message: `User ${userData.email} saved.` };
  };

  const doLogin = async (action, data) => {
    try {
      const response = await fetch("/api/scraper/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        logout();
        toast.error(await RequestUtils.getResponseMessage(response));
        return;
      }
      const shouldProceed = await action(await response.json());
      if (shouldProceed === false) {
        return;
      }
      router.replace("/monitors");
      toast.success("Login successful!");
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const userLogin = async (event) => {
    event.preventDefault();
    const userLoginAction = async (loginData) => {
      const saveResult = await userSave({ email, jwt: loginData.token });
      if (saveResult.id == null) {
        toast.error(saveResult.message);
        return false;
      }
      login(saveResult.id, email, loginData);
      return true;
    };
    await doLogin(userLoginAction, { email, password });
  };

  const demoLogin = async (event) => {
    event.preventDefault();
    const demoLoginAction = async (loginData) => {
      const demoEmail = getEmailFromJwt(loginData?.token) || DEMO_FALLBACK_EMAIL;
      const saveResult = await userSave({ email: demoEmail, jwt: loginData.token });
      if (saveResult.id == null) {
        toast.error(saveResult.message);
        return false;
      }
      demo(saveResult.id, demoEmail, loginData);
      return true;
    };
    await doLogin(demoLoginAction, { "demo-user": "u", "demo-pass": "p" });
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
        {demoEnabled && (
          <div className="demo-card">
            <form className="demo-form" onSubmit={demoLogin}>
              <input type="email" name="demo-user" value="" readOnly></input>
              <input type="password" name="demo-pass" value="" readOnly></input>
              <p>
                don&apos;t know if it&apos;s for you?
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
