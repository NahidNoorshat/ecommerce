// components/Loader.jsx
"use client";

import { motion } from "framer-motion";
import { FaShoppingCart } from "react-icons/fa";
import { cn } from "@/lib/utils"; // optional, if you use class merging

const Loader = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white shadow-xl"
      >
        {/* Glowing Background Ring */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full bg-blue-500 opacity-20 animate-ping"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="text-blue-600 text-5xl"
          >
            <FaShoppingCart />
          </motion.div>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">
            Loading your experience...
          </p>
          <p className="text-sm text-gray-500">Just a moment please</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Loader;
