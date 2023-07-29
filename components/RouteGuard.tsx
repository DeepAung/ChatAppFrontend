import { AuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react'

function RouteGuard({ children }: any) {
  const router = useRouter();
  const { myUser } = useContext(AuthContext);

  const [authorized, setAuthorized] = useState(false);

  
  useEffect(() => {
    const allowedRoute = ["/login", "/register"];

    if (myUser || allowedRoute.includes(router.pathname)) return;

    router.push("/login");
  }, [myUser, router]);

  return children;
}

export default RouteGuard