import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <div className="page-not-found">
      <p>
        <span>404</span>
        🚧 page not found 🚧
      </p>
      <Link href="/">return to home</Link>
    </div>
  );
};

export default NotFound;
