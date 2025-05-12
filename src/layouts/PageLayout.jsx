import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

const PageLayout = () => {
  return (
    <>
      <div>HEADER</div>
      <Outlet />
      <div>FOOTER</div>
      <ToastContainer position="bottom-right" />
    </>
  );
};

export default PageLayout;
