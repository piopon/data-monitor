import { Outlet } from "react-router-dom";

const PageLayout = () => {
  return (
    <>
      <div>HEADER</div>
      <Outlet />
      <div>FOOTER</div>
    </>
  );
};

export default PageLayout;
