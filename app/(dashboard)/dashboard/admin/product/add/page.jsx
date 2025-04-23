"use client";
import AddProductForm from "@/components/productdetils/AddProductForm";
import UploadProducts from "@/components/productdetils/UploadProducts";
import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"; // shadcn/ui Dialog components

const AddProductPage = () => {
  const [isOpen, setIsOpen] = useState(false); // Modal state

  const handleSubmit = () => {
    console.log("Products uploaded!");
    setIsOpen(false); // Close modal on submit
  };

  return (
    <div className="my-16">
      {/* Flex container to push button to the right */}
      <div className="flex justify-center mb-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className=" bg-green-600 ml-44 md:ml-72 ">
              Upload Products file
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Products file </DialogTitle>
            </DialogHeader>
            <UploadProducts />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* AddProductForm stays below */}
      <AddProductForm />
    </div>
  );
};

export default AddProductPage;
