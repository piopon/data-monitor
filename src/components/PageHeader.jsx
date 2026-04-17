"use client";

import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import MenuBar from "@/components/MenuBar";
import { LoginContext } from "@/context/Contexts";

import logo from "@/assets/images/logo-64_outline.png";

const PageHeader = ({ appVersion }) => {
  const { userLogged } = useContext(LoginContext);
  return (
    <nav className="page-head">
      <div className="page-head-logo-div">
        <div className="page-head-logo-unit">
          <Link className="page-head-logo-link" href="/" title={appVersion}>
            <Image className="page-head-logo-img" src={logo} alt="data-monitor logo" />
          </Link>
          <span className="page-head-logo-text-wrap">
            <Link className="page-head-logo-title-link" href="/" title={appVersion}>
              <span className="page-head-logo-text">data-monitor</span>
            </Link>
            <span className="page-head-logo-meta">
              <span className="page-head-logo-version">{appVersion}</span>
              <span className="page-head-logo-separator" aria-hidden="true">
                |
              </span>
              <Link className="page-head-logo-docs-link" href="/api/docs" title="Open API docs">
                docs
              </Link>
            </span>
          </span>
        </div>
      </div>
      {userLogged && <MenuBar />}
    </nav>
  );
};

export default PageHeader;
