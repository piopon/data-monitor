'use client'

import { createContext, useContext, useState } from 'react';
import { useRouter } from "next/navigation";
import { LoginContext } from "../context/Contexts";
import { toast } from "react-toastify";

const MenuBar = () => {
  const router = useRouter();
  const { logout } = useContext(LoginContext);

  const userLogout = async (event) => {
    event.preventDefault();
    logout();
    router.replace("/");
    toast.success("Logout successful!");
  };

  return (
    <div className="page-head-menu-div">
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
