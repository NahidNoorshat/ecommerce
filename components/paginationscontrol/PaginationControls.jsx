"use client";

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisible);
    } else if (currentPage + half >= totalPages) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center flex-wrap gap-2 mt-8 mb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-sm"
        aria-label="Previous page"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {pageNumbers[0] > 1 && (
        <>
          <PageButton
            page={1}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
          {pageNumbers[0] > 2 && (
            <span className="px-3 text-gray-400 font-medium">...</span>
          )}
        </>
      )}

      {pageNumbers.map((page) => (
        <PageButton
          key={page}
          page={page}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      ))}

      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-3 text-gray-400 font-medium">...</span>
          )}
          <PageButton
            page={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-sm"
        aria-label="Next page"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

const PageButton = ({ page, currentPage, onPageChange }) => (
  <button
    onClick={() => onPageChange(page)}
    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 ease-in-out shadow-sm ${
      page === currentPage
        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-2 ring-blue-300 ring-opacity-50"
        : "bg-white text-gray-700 hover:bg-gray-100 ring-1 ring-gray-200"
    }`}
    aria-label={`Page ${page}`}
    aria-current={page === currentPage ? "page" : undefined}
  >
    {page}
  </button>
);

export default PaginationControls;
