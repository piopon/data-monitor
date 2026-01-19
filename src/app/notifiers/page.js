"use client";

import { useContext, useEffect } from "react";
import { PageContext } from "@/context/Contexts";
import UserAccess from "@/components/UserAccess";
import NotifiersPage from "@/pages/NotifiersPage";

export default function Notifiers() {
  const { setPageId } = useContext(PageContext);

  useEffect(() => {
    setPageId("notifiers");
  }, [setPageId]);

  return (
    <UserAccess>
      <NotifiersPage />
    </UserAccess>
  );
}
