import { Link } from "react-router-dom";

import logo from "../assets/images/logo-64_outline.png";

const PageHeader = () => {
  return (
    <nav className="page-nav">
      <div className="page-nav-logo-div">
        <Link className="page-nav-logo-link" to="/">
          <img className="page-nav-logo-img" src={logo} alt="data-monitor logo" />
          <span className="page-nav-logo-text">data-monitor</span>
        </Link>
      </div>
    </nav>
  );
};

export default PageHeader;
