import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import PageLayout from "./layouts/PageLayout";
import LoginPage from "./pages/LoginPage";
import DataPage from "./pages/DataPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<PageLayout />}>
      <Route index element={<LoginPage />} />
      <Route path="/data" element={<DataPage />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
