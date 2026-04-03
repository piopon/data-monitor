"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginContext } from "@/context/Contexts";

const UserAccess = ({ children }) => {
  const { authReady, userLogged } = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    if (authReady && !userLogged) {
      router.replace("/");
    }
  }, [authReady, userLogged, router]);

  if (!authReady || !userLogged) return null;

  return children;
};

export default UserAccess;
