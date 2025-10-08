import React from "react";

const SearchFilters = ({
    search,
    onSearchChange,
    onClearFilters,
    categories,
    category,
    onCategoryChange,
}) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            {/* Search + Clear */}
            <div className="flex flex-1 gap-2">
                <input
                    type="text"
                    placeholder="Search by product, supplier, or location..."
                    value={search}
                    onChange={onSearchChange}
                    className="border rounded p-2 flex-1"
                />
                <button
                    onClick={onClearFilters}
                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                >
                    Clear Filters
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={`px-4 py-2 rounded ${category === cat
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SearchFilters;
