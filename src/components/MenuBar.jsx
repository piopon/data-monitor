import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LoginContext } from "../context/Contexts";
import { toast } from "react-toastify";

const MenuBar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(LoginContext);

  const userLogout = async (event) => {
    event.preventDefault();
    logout();
    navigate("/", { replace: true });
    toast.success("Logout successful!");
  };

  return <div className="page-head-menu-div">
      <section id="logout-section">
        <form className="logout-form" onSubmit={userLogout}>
          <div className="logout-submit-div">
            <button type="submit" className="logout-submit">logout</button>
          </div>
        </form>
      </section>
  </div>;
};

export default MenuBar;
