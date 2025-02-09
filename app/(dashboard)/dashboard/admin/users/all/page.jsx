"use client";
import UserList from "@/components/usermanagement/UserList";
import { useUserManagement } from "@/hooks/useUserManagement";
import React from "react";

const page = () => {
  const { users, handleDelete, handleEdit } = useUserManagement();
  return (
    <>
      <UserList users={users} onDelete={handleDelete} />
    </>
  );
};

export default page;
