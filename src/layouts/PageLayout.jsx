import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PageHeader from "../components/PageHeader";

const PageLayout = () => {
  return (
    <div className="page-container">
      <PageHeader />
      <Outlet />
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default PageLayout;
