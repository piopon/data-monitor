"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AppConfig } from "@/config/AppConfig";
import { LoginContext, PageContext } from "@/context/Contexts";

const MenuBar = () => {
  const config = AppConfig.getConfig();
  const router = useRouter();
  const { isDemo, challenge, logout, userId } = useContext(LoginContext);
  const { pageId } = useContext(PageContext);

  const getValidUserId = () => {
    const parsed = Number.parseInt(String(userId()), 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  };

  const viewConfig = async (event) => {
    event.preventDefault();
    router.push(`${config.scraper.public}${config.scraper.endpoints.edit}${challenge}`);
  };

  const viewNotifiers = async (event) => {
    event.preventDefault();
    router.replace("/notifiers");
  };

  const viewMonitors = async (event) => {
    event.preventDefault();
    router.replace("/monitors");
  };

  const cleanupDemoSession = async () => {
    const logoutResponse = await fetch("/api/scraper/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "demo-user": "user", "demo-pass": "pass" }),
    });
    if (!logoutResponse.ok) {
      return { ok: false, cause: "Issues on backend side" };
    }
    const currentUserId = getValidUserId();
    if (currentUserId == null) {
      return { ok: false, cause: "Invalid user ID" };
    }
    const cleanupResponse = await fetch(`/api/user?id=${currentUserId}`, {
      method: "DELETE",
    });
    if (!cleanupResponse.ok) {
      return { ok: false, cause: "Cannot remove demo user" };
    }
    return { ok: true };
  };

  const userLogout = async (event) => {
    event.preventDefault();
    let response = isDemo ? await cleanupDemoSession() : { ok: true };
    logout();
    router.replace("/");
    if (response.ok) {
      toast.success("Logout successful!");
    } else {
      toast.warn(`Logout successful. Warning: ${response.cause}`);
    }
  };

  return (
    <div className="page-head-menu-div">
      {"monitors" === pageId && (
        <section className="menu-section">
          <form className="menu-item-form" onSubmit={viewNotifiers}>
            <div className="menu-item-div">
              <button type="submit" className="menu-item-button">
                notifiers
              </button>
            </div>
          </form>
        </section>
      )}
      {"notifiers" === pageId && (
        <section className="menu-section">
          <form className="menu-item-form" onSubmit={viewMonitors}>
            <div className="menu-item-div">
              <button type="submit" className="menu-item-button">
                monitors
              </button>
            </div>
          </form>
        </section>
      )}
      {config.scraper.public && challenge && (
        <section className="menu-section">
          <form className="menu-item-form" onSubmit={viewConfig}>
            <div className="menu-item-div">
              <button type="submit" className="menu-item-button">
                scraper
              </button>
            </div>
          </form>
        </section>
      )}
      <section className="menu-section">
        <form className="menu-item-form" onSubmit={userLogout}>
          <div className="menu-item-div">
            <button type="submit" className="menu-item-button">
              logout
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default MenuBar;
