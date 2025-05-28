import "./index.css";

import { ToastContainer } from "react-toastify";
import PageHeader from "@/components/PageHeader";
import LoginProvider from "@/context/LoginProvider";

export const metadata = {
  title: "data-monitor",
  description: "Service to monitor data received from scraper",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LoginProvider>
          <div className="page-container">
            <PageHeader />
            <div className="page-content">{children}</div>
            <ToastContainer position="bottom-right" />
          </div>
        </LoginProvider>
      </body>
    </html>
  );
}
