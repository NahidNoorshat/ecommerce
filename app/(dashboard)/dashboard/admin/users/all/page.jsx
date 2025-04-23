"use client";
import { Button } from "@/components/ui/button";
import UserList from "@/components/usermanagement/UserList";
import { useUserManagement } from "@/hooks/useUserManagement";
import Link from "next/link"; // Import Link

const page = () => {
  const { users, handleDelete, handleEdit } = useUserManagement();

  return (
    <div className="my-16 flex flex-col gap-5 px-7 ">
      {/* Use Link to wrap the Button component */}
      <Link
        href="/dashboard/admin/users/addUsers"
        passHref
        className=" flex justify-end pr-7 lg:pr-1 "
      >
        <Button>Add User</Button>
      </Link>
      <div className=" md:pr-12 lg:pr-1 ">
        <UserList users={users} onDelete={handleDelete} />
      </div>
    </div>
  );
};

export default page;
