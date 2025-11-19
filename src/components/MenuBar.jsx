"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AppConfig } from "@/config/AppConfig";
import { LoginContext } from "@/context/Contexts";

const MenuBar = () => {
  const config = AppConfig.getConfig();
  const router = useRouter();
  const { challenge, logout } = useContext(LoginContext);

  const viewConfig = async (event) => {
    event.preventDefault();
    router.push(`${config.scraper.public}${config.scraper.endpoints.edit}${challenge}`);
  };

  const userLogout = async (event) => {
    event.preventDefault();
    const response = await fetch("/api/scraper/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "demo-user": "user", "demo-pass": "pass" }),
    });
    logout();
    router.replace("/");
    if (response.ok) {
      toast.success("Logout successful!");
    } else {
      toast.warn("Logout successful, with problems on backend side...")
    }
  };

  return (
    <div className="page-head-menu-div">
      {config.scraper.public && challenge && (
        <section className="menu-section">
          <form className="menu-item-form" onSubmit={viewConfig}>
            <div className="menu-item-div">
              <button type="submit" className="menu-item-button">
                config
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
