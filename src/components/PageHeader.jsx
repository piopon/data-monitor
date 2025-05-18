import { useContext } from "react";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/Contexts";
import MenuBar from "./MenuBar";

import logo from "../assets/images/logo-64_outline.png";

const PageHeader = () => {
  const { userLogged } = useContext(LoginContext);
  return (
    <nav className="page-head">
      <div className="page-head-logo-div">
        <Link className="page-head-logo-link" to="/">
          <img className="page-head-logo-img" src={logo} alt="data-monitor logo" />
          <span className="page-head-logo-text">data-monitor</span>
        </Link>
      </div>
      {userLogged && (<MenuBar />)}
    </nav>
  );
};

export default PageHeader;
