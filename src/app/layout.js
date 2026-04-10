import "./index.css";
import "swagger-ui-dist/swagger-ui.css";

import { ToastContainer } from "react-toastify";
import PageHeader from "@/components/PageHeader";
import LoginProvider from "@/context/LoginProvider";
import PageProvider from "@/context/PageProvider";
import { getAppVersion } from "@/lib/AppVersion";

export const metadata = {
  title: "data-monitor",
  description: "Service to monitor data received from scraper",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  const appVersion = getAppVersion();
  return (
    <html lang="en">
      <body>
        <LoginProvider>
          <div className="page-container">
            <PageProvider>
              <PageHeader appVersion={appVersion} />
              <div className="page-content">{children}</div>
              <ToastContainer position="bottom-right" />
            </PageProvider>
          </div>
        </LoginProvider>
      </body>
    </html>
  );
}
