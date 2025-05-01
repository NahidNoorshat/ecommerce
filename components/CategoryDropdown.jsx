"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES_API } from "@/utils/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdOutlineCategory } from "react-icons/md";

export default function CategoryDropdown() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${CATEGORIES_API}/`);
        const data = await response.json();
        const categoriesArray = Array.isArray(data) ? data : data.results || [];
        setCategories(buildCategoryTree(categoriesArray));
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  const buildCategoryTree = (flatCategories) => {
    const categoryMap = {};
    flatCategories.forEach((cat) => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });

    const tree = [];
    flatCategories.forEach((cat) => {
      const parentId =
        cat.parent && typeof cat.parent === "object" ? cat.parent.id : null;
      if (parentId && categoryMap[parentId]) {
        categoryMap[parentId].children.push(categoryMap[cat.id]);
      } else {
        tree.push(categoryMap[cat.id]);
      }
    });

    return tree;
  };

  const renderSubCategories = (subcategories) => {
    return subcategories.map((subcat) =>
      subcat.children.length > 0 ? (
        <DropdownMenuSub key={subcat.id}>
          <DropdownMenuSubTrigger
            onClick={() => router.push(`/search?category=${subcat.id}`)}
            className="w-full flex justify-between items-center"
          >
            {subcat.name}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {renderSubCategories(subcat.children)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      ) : (
        <DropdownMenuItem key={subcat.id} asChild>
          <a href={`/search?category=${subcat.id}`} className="w-full">
            {subcat.name}
          </a>
        </DropdownMenuItem>
      )
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center text-sm gap-2 border border-gray-200 px-2 py-1 rounded-md shadow-md hover:shadow-none hoverEffect transition-all duration-200">
          <MdOutlineCategory className="text-2xl text-darkBlue" />
          <div className="flex flex-col">
            <p className="text-xs">Browse</p>
            <p className="font-semibold">Categories</p>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" sideOffset={4} align="start">
        {categories.map((cat) =>
          cat.children.length > 0 ? (
            <DropdownMenuSub key={cat.id}>
              <DropdownMenuSubTrigger
                onClick={() => router.push(`/search?category=${cat.id}`)}
                className="w-full flex justify-between items-center"
              >
                {cat.name}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {renderSubCategories(cat.children)}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem key={cat.id} asChild>
              <a href={`/search?category=${cat.id}`} className="w-full">
                {cat.name}
              </a>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
