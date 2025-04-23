import ProductTable from "@/components/productdetils/ProductTable";
import Link from "next/link";

const Page = () => {
  return (
    <div className="my-16 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">All Product List</h1>
        <Link href="/dashboard/admin/product/add">
          <button
            // Redirect to addProduct page
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Add Product
          </button>
        </Link>
      </div>
      <ProductTable />
    </div>
  );
};

export default Page;
