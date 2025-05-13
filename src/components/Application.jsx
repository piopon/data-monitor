import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import ErrorPage from "../pages/ErrorPage";
import LoginPage from "../pages/LoginPage";
import DataPage from "../pages/DataPage";
import UserAccess from "./UserAccess";

const Application = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<PageLayout />}>
        <Route index element={<LoginPage />} />
        <Route
          path="/data"
          element={
            <UserAccess>
              <DataPage />
            </UserAccess>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Route>
    )
  );
  return <RouterProvider router={router} />;
};

export default Application;
