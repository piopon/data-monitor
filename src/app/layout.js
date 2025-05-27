import "./index.css";

export const metadata = {
  title: "data-monitor",
  description: "Service to monitor data received from scraper",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
