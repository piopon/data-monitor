"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginContext } from "@/context/Contexts";

const UserAccess = ({ children }) => {
  const { userLogged } = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    if (!userLogged) {
      router.replace("/");
    }
  }, [userLogged, router]);

  if (!userLogged) return null;

  return children;
};

export default UserAccess;
