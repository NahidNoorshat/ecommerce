"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { USERS_API } from "@/utils/config";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get(`${USERS_API}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          phone_number: res.data.phone_number || "",
          address: res.data.address || "",
        });
      } catch (err) {
        toast.error("Failed to load user data");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfilePicture(file);
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("access");
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      if (profilePicture) {
        formData.append("profile_picture", profilePicture);
      }

      await axios.patch(`${USERS_API}/users/${user.id}/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Profile updated successfully 👌");

      router.push("/customerProfile"); // Redirect to profile page
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Something went wrong while updating"
      );
    }
  };

  if (!user) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={
                  profilePicture
                    ? URL.createObjectURL(profilePicture)
                    : user.profile_picture || ""
                }
              />
              <AvatarFallback>
                <UserIcon className="w-6 h-6 text-gray-500" />
              </AvatarFallback>
            </Avatar>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          <Input
            name="first_name"
            placeholder="First Name"
            value={form.first_name}
            onChange={handleChange}
          />
          <Input
            name="last_name"
            placeholder="Last Name"
            value={form.last_name}
            onChange={handleChange}
          />
          <Input
            name="phone_number"
            placeholder="Phone Number"
            value={form.phone_number}
            onChange={handleChange}
          />
          <Input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />

          <Button className="w-full mt-2" onClick={handleUpdate}>
            Update Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
