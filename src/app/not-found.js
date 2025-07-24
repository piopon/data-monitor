import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <>
      <p className="page-not-found">
        <span>404</span>
        🚧 page not found 🚧
      </p>
      <Link href="/">return to home</Link>
    </>
  );
};

export default NotFound;
