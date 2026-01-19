"use client";

import { useState } from "react";
import { PageContext } from "@/context/Contexts";

const PageProvider = ({ children }) => {
  const [pageId, setPageId] = useState("");

  return (
    <PageContext.Provider value={{ pageId, setPageId }}>
      {children}
    </PageContext.Provider>
  );
};

export default PageProvider;
