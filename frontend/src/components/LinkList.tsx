// Import necessary modules and hooks
import React, { useState, ChangeEvent } from "react";
import { useUrlShortener } from "./UrlShortener";

const LinkList: React.FC = () => {
  // Destructure state and methods from the custom hook
  const {
    links,
    loading,
    redirectToOriginalUrl,
    searchTerm,
    setSearchTerm,
    isSearching,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    setItemsPerPage
  } = useUrlShortener();

  // State to track which link's copy button was clicked
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Function to copy the shortened URL to the clipboard
  const copyToClipboard = (slug: string, id: number) => {
    const shortUrl = `http://localhost:8000/r/${slug}`;
    navigator.clipboard
      .writeText(shortUrl)
      .then(() => {
        setCopiedId(id); // Mark the link as copied
        setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error("Failed to copy text: ", err);
      });
  };

  // Function to truncate long URLs for display
  const truncateUrl = (url: string, maxLength = 40): string => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + "...";
  };

  // Show loading spinner if data is being fetched
  if (loading && links.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        {/* Loading spinner */}
        <svg
          className="animate-spin h-4 w-4 mx-auto mb-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-sm">Loading links...</p>
      </div>
    );
  }

  // Handle search input changes
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  // Generate pagination numbers dynamically
  const getPageNumbers = (): (number | string)[] => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  return (
    <div className="divide-y divide-gray-100">
      {/* Search bar and items per page selector */}
      <div className="p-4 bg-gray-50">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching
              ? <svg
                  className="animate-spin h-4 w-4 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              : <svg
                  className="h-4 w-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>}
          </div>
          <input
            type="text"
            placeholder="Search by URL or slug..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={`block w-full pl-10 pr-10 py-2 border ${isSearching
              ? "border-blue-300"
              : "border-gray-300"} rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          />
          {searchTerm &&
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                onClick={() => setSearchTerm("")}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>}
        </div>
        {isSearching &&
          <div className="mt-1 text-xs text-blue-600">Searching...</div>}

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div>
            <select
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
              className="border border-gray-300 rounded-md text-xs p-1"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* List of links */}
      <ul className="divide-y divide-gray-100">
        {links.map(link => {
          const shortUrl =
            link.shortened_url || `http://localhost:8000/r/${link.slug}`;
          const isCopied = copiedId === link.id;

          return (
            <li key={link.id} className="px-4 py-3 transition hover:bg-gray-50">
              {/* Link details and copy button */}
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <h3
                    className="text-xs font-medium text-blue-600 truncate mb-1 hover:underline cursor-pointer"
                    title={shortUrl}
                    onClick={() => redirectToOriginalUrl(link.slug)}
                  >
                    {shortUrl}
                  </h3>
                  <p
                    className="text-xs text-gray-500 truncate"
                    title={link.url}
                  >
                    {truncateUrl(link.url)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(link.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(link.slug, link.id)}
                  className={`inline-flex items-center p-1.5 border rounded-md text-xs font-medium transition-colors ${isCopied
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                  title={isCopied ? "Copied!" : "Copy to clipboard"}
                >
                  {isCopied
                    ? <svg
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    : <svg
                        className="h-3.5 w-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>}
                </button>
              </div>
            </li>
          );
        })}

        {/* Message when no links match the search */}
        {links.length === 0 &&
          !loading &&
          <li className="px-4 py-6 text-center text-gray-500">
            <p className="text-sm">
              No matching links found. Try adjusting your search.
            </p>
          </li>}
      </ul>

      {/* Pagination controls */}
      {totalPages > 1 &&
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage ===
              1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage ===
              totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {links.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    currentPage * itemsPerPage,
                    (currentPage - 1) * itemsPerPage + links.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {totalPages * itemsPerPage}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage ===
                  1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {getPageNumbers().map((pageNumber, index) =>
                  <button
                    key={index}
                    onClick={() =>
                      typeof pageNumber === "number" &&
                      setCurrentPage(pageNumber)}
                    disabled={pageNumber === "..."}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNumber ===
                    currentPage
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : pageNumber === "..."
                        ? "bg-white border-gray-300 text-gray-500"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
                  >
                    {pageNumber}
                  </button>
                )}

                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage ===
                  totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-500 hover:bg-gray-50"}`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>}
    </div>
  );
};

export default LinkList;
