import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import PageLayout from "../layouts/PageLayout";
import ErrorPage from "../pages/ErrorPage";
import LoginPage from "../pages/LoginPage";
import DataPage from "../pages/DataPage";
import UserAccess from "./UserAccess";
import GuestAccess from "./GuestAccess";

const Application = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<PageLayout />}>
        <Route
          index
          element={
            <GuestAccess>
              <LoginPage />
            </GuestAccess>
          }
        />
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
