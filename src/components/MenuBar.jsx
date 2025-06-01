"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { LoginContext } from "@/context/Contexts";
import { AppConfig } from "@/config/AppConfig";

const MenuBar = () => {
  const router = useRouter();
  const config = AppConfig.getConfig();
  const { logout } = useContext(LoginContext);

  const viewConfig = async (event) => {
    event.preventDefault();
    router.replace(`http://${config.scraper.host}:${config.scraper.port}`);
  };

  const userLogout = async (event) => {
    event.preventDefault();
    logout();
    router.replace("/");
    toast.success("Logout successful!");
  };

  return (
    <div className="page-head-menu-div">
      <section>
        <form onSubmit={viewConfig}>
          <div >
            <button type="submit">
              config
            </button>
          </div>
        </form>
      </section>
      <section id="logout-section">
        <form className="logout-form" onSubmit={userLogout}>
          <div className="logout-submit-div">
            <button type="submit" className="logout-submit">
              logout
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default MenuBar;
