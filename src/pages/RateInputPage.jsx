import React, { useState, useEffect } from "react";
import axios from "axios";
import RateInputModal from "../components/RateInputModal";
import initialRates from "../data/rateDB.json";
import { API_BASE_URL } from "../config/api";
import ItemDetailsModal from "../components/ItemDetailsModal";

const RateInputPage = () => {
    const [data, setData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
    const [itemToShowDetails, setItemToShowDetails] = useState(null);

    // Tab Filter State
    const [selectedFilterTab, setSelectedFilterTab] = useState("All"); // Default to 'All' or first tab

    // 🔍 Search & Pagination
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    const [totalPages, setTotalPages] = useState(1);


    // --- Fetch from backend ---
    const fetchRates = React.useCallback(async (searchQuery, currentPage, itemsPerPage, filterTab) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE_URL}/rates`, {
                params: {
                    search: searchQuery,
                    page: currentPage, // API expects 1-based page
                    size: itemsPerPage,
                    category: filterTab, // Use filterTab for category filtering
                },
            });

            setData(Array.isArray(res.data.data) ? res.data.data : []); // Strictly ensure data is an array
            setTotalPages(typeof res.data.pages === 'number' ? res.data.pages : 1); // Strictly ensure totalPages is a number
        } catch (err) {
            console.error("Backend fetch failed, using local fallback.", err);

            try {
                const updatedRates = initialRates.map((rate) => ({
                    ...rate,
                    city: rate.city || "Unknown City",
                    vendorName: rate.vendorName || "Unknown Vendor",
                    vendorPhone: rate.vendorPhone || "N/A",
                    vendorAddress: rate.vendorAddress || "N/A",
                }));

                // Filter locally by tab before search/pagination
                const filteredByTab = filterTab && filterTab !== "All"
                    ? updatedRates.filter((item) => {
                        return (item.category || "Uncategorized").toLowerCase() === filterTab.toLowerCase();
                    })
                    : updatedRates;

                // 🔍 Local search
                const filtered = filteredByTab.filter(
                    (item) =>
                        (item.itemNo &&
                            item.itemNo.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (item.description &&
                            item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );

                // 🔢 Sort locally by itemNo
                const sorted = [...filtered].sort((a, b) => {
                    const parseItemNo = (val) => String(val).split(".").map(Number);
                    const aParts = parseItemNo(a.itemNo);
                    const bParts = parseItemNo(b.itemNo);
                    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                        const aVal = aParts[i] || 0;
                        const bVal = bParts[i] || 0;
                        if (aVal !== bVal) return aVal - bVal;
                    }
                    return 0;
                });

                // 📝 Local pagination
                const localTotalPages = Math.ceil(sorted.length / itemsPerPage);
                const paginated = sorted.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                );

                setData(Array.isArray(paginated) ? paginated : []);
                setTotalPages(typeof localTotalPages === 'number' ? localTotalPages : 1);
                setError("⚠️ Showing local data (backend unavailable).");
            } catch (jsonErr) {
                console.error("Local JSON failed:", jsonErr);
                setError("Failed to load rates from local data.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates(searchQuery, currentPage, itemsPerPage, selectedFilterTab);
    }, [fetchRates, searchQuery, currentPage, itemsPerPage, selectedFilterTab]);

    // --- Save (Add/Edit) ---
    const handleSaveItem = async (item) => {
        try {
            if (item._id) {
                await axios.put(`${API_BASE_URL}/rates/${item._id}`, item);
            } else {
                await axios.post(`${API_BASE_URL}/rates`, item);
            }
            await fetchRates(searchQuery, currentPage, itemsPerPage, selectedFilterTab);
        } catch (err) {
            console.error("Save failed:", err);
            setError("Failed to save rate.");
        }
    };

    // --- Delete ---
    const handleDeleteItem = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                const deleteUrl = `${API_BASE_URL}/rates/${id}`;
                await axios.delete(deleteUrl);
                await fetchRates(searchQuery, currentPage, itemsPerPage, selectedFilterTab);
            } catch (err) {
                console.error("Delete failed:", err);
                setError("Failed to delete rate.");
            }
        }
    };

    // --- Pagination ---
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPaginationRange = (totalPages, currentPage, siblings = 1) => {
        let pages = [];
        const leftSiblingIndex = Math.max(currentPage - siblings, 1);
        const rightSiblingIndex = Math.min(currentPage + siblings, totalPages);

        const shouldShowLeftDots = leftSiblingIndex > 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

        const firstPageIndex = 1;
        const lastPageIndex = totalPages;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            let leftRange = Array.from(
                { length: 3 + 2 * siblings },
                (_, i) => i + 1
            ).filter((page) => page <= totalPages);
            pages = [...leftRange, "...", lastPageIndex];
        } else if (shouldShowLeftDots && !shouldShowRightDots) {
            let rightRange = Array.from(
                { length: 3 + 2 * siblings },
                (_, i) => totalPages - (3 + 2 * siblings) + 1 + i
            ).filter((page) => page > 0 && page <= totalPages);
            pages = [firstPageIndex, "...", ...rightRange];
        } else if (shouldShowLeftDots && shouldShowRightDots) {
            let middleRange = Array.from(
                { length: 2 * siblings + 1 },
                (_, i) => currentPage - siblings + i
            );
            pages = [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
        } else {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        return pages.filter((value, index, self) => self.indexOf(value) === index);
    };

    const paginationRange = getPaginationRange(totalPages, currentPage);

    const filterTabs = [
        "All",
        "ALUMINIUM WORK",
        "BRICK WORK",
        "CONCRETE WORK",
        "DEMOLISHEN",
        "DRAINAGE",
        "EARTHWORK",
        "FINISHING",
        "FLOORING",
        "HIRE CHARGES",
        "LABOUR",
        "LANDSCAPING",
        "MARBLE WORK",
        "MISCELLANEUS",
        "MORTARS",
        "Material",
        "Misc",
        "PILE WORK",
        "RCC",
        "REPAIRS",
        "ROAD WORK",
        "ROOFING",
        "SANITARY",
        "STEEL WORK",
        "STONE WORK",
        "WATER PROOFING",
        "WOOD WORK"
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <header className="bg-white shadow-sm flex items-center justify-between px-6 py-4">
                <h1 className="text-2xl font-bold text-[#2c3e50]">Rate Input System</h1>
                <div className="flex items-center gap-4">
                    {/* Removed Bell icon button */}
                    <div className="relative p-2 hover:bg-gray-100 rounded-full">
                        {/* Placeholder for future notification icon */}
                    </div>
                    {/* Removed User icon button */}
                    <div className="p-2 hover:bg-gray-100 rounded-full">
                        {/* Placeholder for future user icon */}
                    </div>
                </div>
            </header>

            {/* Consolidated Top Section: Add Rate Button and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 px-6 gap-4">
                {/* Add Rate Button - occupies 50% width on larger screens */}
                <div className="w-full sm:w-1/2 flex justify-start">
                    <button
                        onClick={() => {
                            setItemToEdit(null);
                            setShowModal(true);
                        }}
                        className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        + Add Rate
                    </button>
                </div>

                {/* Search Bar - occupies 50% width on larger screens */}
                <div className="w-full sm:w-1/2 flex justify-end">
                    <div className="relative w-full max-w-md sm:max-w-full">
                        <input
                            type="text"
                            placeholder="Search by Item No or Description..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-4 pr-4 py-2 rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tab Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
                {filterTabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setSelectedFilterTab(tab);
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-3 rounded-xl shadow-sm transition-all duration-200 text-center 
              ${selectedFilterTab === tab
                                ? "ring-2 ring-blue-500 shadow-md scale-105"
                                : "hover:shadow-md"}
              ${tab.toLowerCase().includes("work") ? "bg-gray-100" : ""}`}
                    >
                        <span className="text-sm font-medium text-gray-700">{tab}</span>
                    </button>
                ))}
            </div>

            {loading && <div className="mt-4 text-blue-600 text-center">Loading...</div>}
            {error && <div className="mt-4 text-red-600 text-center">{error}</div>}

            {!loading && data.length === 0 && (
                <div className="mt-4 text-gray-600 text-center">No rates found.</div>
            )}

            {data.length > 0 && (
                <>
                    {/* --- Table --- */}
                    <table className="w-full border-collapse border border-gray-300 mt-4">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 p-2 text-center">Item No</th>
                                <th className="border border-gray-300 p-2 w-2/5">Description</th>
                                <th className="border border-gray-300 p-2 text-center">Rate</th>
                                <th className="border border-gray-300 p-2 text-center">Per</th>
                                <th className="border border-gray-300 p-2 text-center">Unit</th>
                                <th className="border border-gray-300 p-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item._id} className="odd:bg-gray-50 even:bg-white">
                                    <td className="border border-gray-300 p-2 text-center w-1/12">
                                        {item.itemNo}
                                    </td>
                                    <td className="border border-gray-300 p-2 w-2/5">
                                        {item.description}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center w-1/12">
                                        {item.rate}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center w-1/12">
                                        {item.per}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center w-1/12">
                                        {item.unit}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center w-1/4">
                                        {item.unit && (
                                            <div className="flex flex-wrap justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setItemToEdit(item);
                                                        setShowModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setItemToShowDetails(item);
                                                        setShowItemDetailsModal(true);
                                                    }}
                                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item._id)}
                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* --- Pagination --- */}
                    <div className="flex flex-wrap justify-center items-center mt-4 space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                        >
                            Prev
                        </button>

                        {paginationRange.map((page, index) =>
                            page === "..." ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-1">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-1 rounded ${currentPage === page
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200"
                                        }`}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {showModal && (
                <RateInputModal
                    show={showModal}
                    onClose={() => {
                        setShowModal(false);
                        setItemToEdit(null);
                    }}
                    onSave={handleSaveItem}
                    initialData={itemToEdit}
                />
            )}

            {showItemDetailsModal && (
                <ItemDetailsModal
                    show={showItemDetailsModal}
                    onClose={() => setShowItemDetailsModal(false)}
                    item={itemToShowDetails}
                />
            )}
        </div>
    );
};

export default RateInputPage;
