"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { USERS_API } from "@/utils/config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function RequestSellerPage() {
  const user = useSelector((state) => state.user.user);
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.warning("Please provide a reason.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${USERS_API}/users/${user.id}/request-seller/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({
          reason,
          business_name: businessName,
          phone,
          website,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");

      toast.success("Your seller request has been submitted.");
      router.push("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 mt-12 bg-white dark:bg-slate-900 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Apply to Become a Seller
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Please fill out this form. Your request will be reviewed by our admin
        team.
      </p>

      <form onSubmit={handleRequest} className="space-y-4">
        <Input
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />

        <Input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Input
          placeholder="Website (optional)"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />

        <Textarea
          placeholder="Tell us why you want to become a seller..."
          rows={5}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
    </div>
  );
}
