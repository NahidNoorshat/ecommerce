export function getStockBadge(stock) {
  if (stock > 10) {
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-800",
    };
  } else if (stock > 0) {
    return {
      label: "Low Stock",
      color: "bg-yellow-100 text-yellow-800",
    };
  } else {
    return {
      label: "Out of Stock",
      color: "bg-red-100 text-red-800",
    };
  }
}
