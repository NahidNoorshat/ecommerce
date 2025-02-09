"use client";

import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * HOC to protect sensitive pages and redirect users based on roles
 * @param {React.Component} WrappedComponent - The component to protect
 * @param {Array<string>} allowedRoles - Roles that are allowed to access the page
 */
const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const { user, loading } = useSelector((state) => state.user);

    useEffect(() => {
      // If user is not authenticated, redirect to login
      if (!loading && !user) {
        router.replace("/login");
      }
      // If user's role is not allowed, redirect to their role-specific dashboard
      else if (
        !loading &&
        user &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
      ) {
        if (user.role === "admin") {
          router.replace("/dashbord/admin");
        } else if (user.role === "seller") {
          router.replace("/dashbord/seller");
        } else {
          router.replace("/dashbord/customer");
        }
      }
    }, [user, loading, router]);

    // While loading, you can show a spinner or placeholder
    if (loading || !user) {
      return <div>Loading...</div>;
    }

    // Render the wrapped component if the user is authenticated and authorized
    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
