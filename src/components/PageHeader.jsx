import { Link } from "react-router-dom";

import logo from "../assets/images/logo-64_outline.png";

const PageHeader = () => {
  return (
    <nav className="page-head">
      <div className="page-head-logo-div">
        <Link className="page-head-logo-link" to="/">
          <img className="page-head-logo-img" src={logo} alt="data-monitor logo" />
          <span className="page-head-logo-text">data-monitor</span>
        </Link>
      </div>
    </nav>
  );
};

export default PageHeader;
