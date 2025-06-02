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
    logout();
    router.replace("/");
    toast.success("Logout successful!");
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
      <section class="menu-section">
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
