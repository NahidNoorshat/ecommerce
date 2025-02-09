import React, { useState } from "react";
import { useUserManagement } from "../../hooks/useUserManagement";
import UserList from "./UserList";
import EditUserForm from "./UserEditModal";
import AddUserForm from "./AddUserForm";

const UserManagement = () => {
  const {
    users,
    selectedUser,
    isEditing,
    error,
    handleDelete,
    handleEdit,
    handleSave,
    addUser,
    setSelectedUser,
  } = useUserManagement();

  const [isAdding, setIsAdding] = useState(false); // State for AddUserForm

  // Handle new user submission
  const handleAddUser = async (newUser) => {
    const result = await addUser(newUser);

    // Check if result is valid and has the success property
    if (result && result?.success) {
      setIsAdding(false);
    } else {
      // Handle error or show a message when result is invalid
      console.error("Error adding user", result);
    }
  };

  // Handle canceling editing or adding user
  const handleCancel = () => {
    setIsAdding(false); // Reset to hide the Add User form
    setSelectedUser(null); // Clear selected user for editing
  };

  return (
    <div className="p-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setIsAdding(true)}
        >
          Add User
        </button>
      </div>

      {/* Display error messages */}
      {error && <p className="text-red-500">{error}</p>}

      {/* User List */}
      <UserList users={users} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Show Edit User Form if Editing */}

      {/* Show Add User Form if Adding */}
      {isAdding && (
        <AddUserForm
          onSave={handleAddUser} // Pass handleAddUser for submission
          onCancel={handleCancel} // Cancel adding user
        />
      )}
    </div>
  );
};

export default UserManagement;
