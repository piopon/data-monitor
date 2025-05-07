import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DataPage from "./pages/DataPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path="/" element={<LoginPage />} />
      <Route path="/data" element={<DataPage />} />
    </Route>
  )
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
