import { useNavigate } from "react-router-dom";

const DataPage = () => {
  const navigate = useNavigate();

  const userLogout = async () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true })
  };

  return (
    <div>
      <button onClick={userLogout}>logout</button>
      <p>DataPage</p>
    </div>
  )
}

export default DataPage