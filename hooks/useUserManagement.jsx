import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://13.51.157.149/api";

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access") : null;

  // Memoize axios instance to avoid unnecessary re-creations
  const axiosInstance = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });
  }, [token]);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await axiosInstance.get("/users/users/");
      setUsers(response.data);
      setError(null); // Clear previous errors
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users.");
      if (error.response?.status === 401) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        router.push("/login");
      }
    }
  }, [axiosInstance, router, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Add new user
  const addUser = async (newUser) => {
    try {
      const formData = new FormData();
      Object.keys(newUser).forEach((key) => {
        if (newUser[key] !== null) {
          formData.append(key, newUser[key]);
        }
      });

      await axiosInstance.post("/users/users/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchUsers(); // Refresh user list
      return { success: true };
    } catch (error) {
      if (error.response?.status === 400) {
        return { success: false, errors: error.response.data };
      }
      setError("Error adding user.");
      return {
        success: false,
        errors: { general: "An unexpected error occurred." },
      };
    }
  };

  // Delete a user
  const handleDelete = async (userId) => {
    try {
      await axiosInstance.delete(`/users/users/${userId}/`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Error deleting user.");
    }
  };

  // Edit user state
  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  // Save updated user details
  const handleSave = async (updatedUser) => {
    if (!updatedUser || !updatedUser.id) {
      console.error("Invalid user data:", updatedUser);
      setError("Invalid user data.");
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/users/users/${updatedUser.id}/`,
        updatedUser
      );

      if (response.status !== 200) {
        throw new Error("Failed to update user");
      }

      // Update the users list state immediately with the new data
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === updatedUser.id ? response.data : user
        )
      );

      setIsEditing(false);
      setSelectedUser(null);
      setError(null);

      return response.data; // Return the updated user data
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
      setError("Error updating user.");
    }
  };

  return {
    users,
    setUsers,
    selectedUser,
    isEditing,
    error,
    handleDelete,
    handleEdit,
    handleSave,
    addUser,
    setSelectedUser,
    fetchUsers,
  };
};
