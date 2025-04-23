"use client";
import AddUserForm from "@/components/usermanagement/AddUserForm";
import React from "react";
import { useUserManagement } from "@/hooks/useUserManagement";

const page = () => {
  const { addUser } = useUserManagement();
  return (
    <>
      <div className=" my-16 ">
        <AddUserForm onSave={addUser} />
      </div>
    </>
  );
};

export default page;
