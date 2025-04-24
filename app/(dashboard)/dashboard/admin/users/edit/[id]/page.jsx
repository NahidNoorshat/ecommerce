"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader from "@/components/Loader";
import { USERS_API } from "@/utils/config";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState({
    username: "",
    email: "",
    role: "",
    address: "",
    phone_number: "",
    is_active: false,
    is_verified: false,
    profile_picture: "",
  });
  const [originalUsername, setOriginalUsername] = useState(""); // State for original username
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null); // File for upload

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      setLoading(true);

      try {
        const token = localStorage.getItem("access");
        const response = await fetch(`${USERS_API}/users/${id}/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const data = await response.json();
        setUser({
          ...data,
          profile_picture: data.profile_picture || "",
        });
        setOriginalUsername(data.username); // Set original username

        if (data.profile_picture) {
          setImagePreview(data.profile_picture);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("access");

    try {
      const updateData = {
        username: user.username,
        email: user.email,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        role: user.role,
        phone_number: user.phone_number || "",
        address: user.address || "",
        is_verified: user.is_verified,
        is_active: user.is_active,
      };

      const formData = new FormData();

      // Append text fields
      Object.keys(updateData).forEach((key) => {
        formData.append(key, updateData[key]);
      });

      // Append profile picture if changed
      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }

      const response = await fetch(`${USERS_API}/users/${id}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData, // Send FormData for mixed data types
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update user");
      }

      router.push("/dashboard/admin/users/all");
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-md rounded-lg my-16">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit User
      </h1>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <Input
          type="text"
          value={user.username || ""}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
          placeholder="Username"
        />
        <Input
          type="email"
          value={user.email || ""}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="Email"
        />
        <select
          value={user.role || ""}
          onChange={(e) => setUser({ ...user, role: e.target.value })}
          className="w-full p-2 border rounded-md dark:bg-gray-800 dark:text-white"
        >
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="customer">Customer</option>
        </select>
        <Input
          type="text"
          value={user.address || ""}
          onChange={(e) => setUser({ ...user, address: e.target.value })}
          placeholder="Address"
        />
        <Input
          type="text"
          value={user.phone_number || ""}
          onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
          placeholder="Phone"
        />

        {/* Profile Picture Upload */}
        <div>
          <label className="block text-sm font-medium dark:text-white">
            Profile Picture
          </label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover mt-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-md mt-2 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={user.is_active}
            onChange={(e) => setUser({ ...user, is_active: e.target.checked })}
          />
          <span className="dark:text-white">Is Active</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={user.is_verified}
            onChange={(e) =>
              setUser({ ...user, is_verified: e.target.checked })
            }
          />
          <span className="dark:text-white">Is Verified</span>
        </label>

        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/admin/users")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ease-in-out shadow-lg"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
