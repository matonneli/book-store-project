import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const generatePageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
            return pages;
        }

        const sidePages = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(0, currentPage - sidePages);
        let endPage = Math.min(totalPages - 1, currentPage + sidePages);

        if (endPage - startPage < maxVisiblePages - 1) {
            if (startPage === 0) {
                endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
            } else if (endPage === totalPages - 1) {
                startPage = Math.max(0, endPage - maxVisiblePages + 1);
            }
        }

        if (startPage > 0) {
            pages.push(0);
            if (startPage > 1) {
                pages.push('...');
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) {
                pages.push('...');
            }
            pages.push(totalPages - 1);
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();

    return (
        <div className="flex justify-center items-center gap-2 mt-8 mb-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentPage === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-[#321d4f] border border-gray-300 hover:bg-[#f5f3ff] hover:border-[#321d4f]'
                }
                `}
            >
                ← Previous
            </button>

            <div className="flex gap-1">
                {pageNumbers.map((page, index) => {
                    if (page === '...') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-3 py-2 text-gray-400 text-sm font-medium"
                            >
                                ...
                            </span>
                        );
                    }

                    const isActive = page === currentPage;

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`
                                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-10
                                ${isActive
                                ? 'bg-[#321d4f] text-white shadow-md'
                                : 'bg-white text-[#321d4f] border border-gray-300 hover:bg-[#f5f3ff] hover:border-[#321d4f]'
                            }
                            `}
                        >
                            {page + 1}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentPage >= totalPages - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-[#321d4f] border border-gray-300 hover:bg-[#f5f3ff] hover:border-[#321d4f]'
                }
                `}
            >
                Next →
            </button>

            <div className="ml-4 text-sm text-gray-600 font-medium">
                Page {currentPage + 1} из {totalPages}
            </div>
        </div>
    );
};

export default Pagination;