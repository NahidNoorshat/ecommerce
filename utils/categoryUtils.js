// F:\BrainAlgo It\Ecommerce\Grocery\grocery-ecom\utils\categoryUtils.js
export const getCategoryBreadcrumb = (category) => {
  const hierarchy = [];
  let current = category;

  while (current) {
    hierarchy.unshift(current.name);
    current = current.parent;
  }

  return hierarchy.join(" > ");
};
