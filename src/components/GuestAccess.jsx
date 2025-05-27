'use client'

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginContext } from "../context/Contexts";

const GuestAccess = ({ children }) => {
  const { userLogged } = useContext(LoginContext);
  const router = useRouter();

  useEffect(() => {
    if (userLogged) {
      router.replace('/data');
    }
  }, [userLogged, router]);

  if (userLogged) return null;

  return children;
};

export default GuestAccess;
