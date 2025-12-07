"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AppConfig } from "@/config/AppConfig";
import { LoginContext, PageContext } from "@/context/Contexts";

const MenuBar = () => {
  const config = AppConfig.getConfig();
  const router = useRouter();
  const { pageId, setPageId } = useContext(PageContext);
  const { isDemo, challenge, logout } = useContext(LoginContext);

  const viewConfig = async (event) => {
    event.preventDefault();
    router.push(`${config.scraper.public}${config.scraper.endpoints.edit}${challenge}`);
  };

  const viewNotifiers = async (event) => {
    event.preventDefault();
    router.replace("/notifiers");
    setPageId("notifier");
  };

  const viewHome = async (event) => {
    event.preventDefault();
    router.replace("/");
    setPageId("home");
  };

  const userLogout = async (event) => {
    event.preventDefault();
    const response = !isDemo
      ? { ok: true }
      : await fetch("/api/scraper/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "demo-user": "user", "demo-pass": "pass" }),
        });
    logout();
    router.replace("/");
    if (response.ok) {
      toast.success("Logout successful!");
    } else {
      toast.warn("Logout successful, with problems on backend side...");
    }
  };

  return (
    <div className="page-head-menu-div">
      {"home" === pageId && (
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
      {"notifier" === pageId && (
        <section className="menu-section">
          <form className="menu-item-form" onSubmit={viewHome}>
            <div className="menu-item-div">
              <button type="submit" className="menu-item-button">
                home
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
