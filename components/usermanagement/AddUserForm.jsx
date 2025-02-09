import React, { useState } from "react";

const AddUserForm = ({ onSave, onCancel }) => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "", // Password is required for creating a user
    role: "customer", // Default role
    is_verified: false,
    is_active: true,
    profile_picture: null, // For file upload
    phone_number: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    // Clear the error for the field when the user starts typing
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setNewUser({ ...newUser, profile_picture: e.target.files[0] });
    // Clear the error for the file field when a file is selected
    setErrors((prevErrors) => ({ ...prevErrors, profile_picture: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onSave(newUser); // Call API function

    console.log(result, "cheking what i got at returen.. ");
  };

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
        Add New User
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={newUser.username}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            required
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={newUser.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={newUser.password}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            required
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Role
          </label>
          <select
            name="role"
            value={newUser.role}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
            <option value="seller">Seller</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm mt-1">{errors.role}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Phone Number
          </label>
          <input
            type="text"
            name="phone_number"
            value={newUser.phone_number}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          {errors.phone_number && (
            <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Address
          </label>
          <textarea
            name="address"
            value={newUser.address}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Profile Picture
          </label>
          <input
            type="file"
            name="profile_picture"
            onChange={handleFileChange}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
          {errors.profile_picture && (
            <p className="text-red-500 text-sm mt-1">
              {errors.profile_picture}
            </p>
          )}
        </div>
        {errors.general && (
          <p className="text-red-500 text-sm mb-4">{errors.general}</p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
