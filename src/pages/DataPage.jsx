import { useNavigate } from "react-router-dom";

const DataPage = () => {
  const navigate = useNavigate();

  const userLogout = async () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
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
      <p>DataPage</p>
    </>
  );
};

export default DataPage;
