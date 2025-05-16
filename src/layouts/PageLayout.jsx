import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PageHeader from "../components/PageHeader";

const PageLayout = () => {
  return (
    <>
      <PageHeader />
      <Outlet />
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default PageLayout;
