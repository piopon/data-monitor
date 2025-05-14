import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const DataPage = () => {
  const navigate = useNavigate();

  const userLogout = async () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
    toast.success("Logout successful!");
  };

  return (
    <>
      <section id="logout-section">
        <form className="logout-form" onSubmit={userLogout}>
          <div className="logout-submit-div">
            <button type="submit" className="logout-submit">logout</button>
          </div>
        </form>
      </section>
      <section id="data-section">DataPage</section>
    </>
  );
};

export default DataPage;
