import React, { useEffect, useState, useCallback } from "react";
import PriceTable from "../components/PriceTable";
import { fetchAllThreeEndpoints } from "../data/apiDataFetcher";
import SearchFilters from "../components/SearchFilters";

const PricesPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Filters
    const [category, setCategory] = useState("All");
    const [categories, setCategories] = useState([]);

    // Pagination
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 200;

    // Latency tracking
    const [latency, setLatency] = useState(null);
    const [loadingStart, setLoadingStart] = useState(null);

    // Debounce search input
    useEffect(() => {
        const trimmed = search.trim();
        const handler = setTimeout(() => {
            setDebouncedSearch(trimmed.length >= 2 ? trimmed : "");
        }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    // Fetch paginated data from server
    const fetchData = useCallback(async () => {
        setLoading(true);
        setLoadingStart(Date.now());
        setLatency(null);

        try {
            const res = await fetchAllThreeEndpoints(page, limit, {
                search: debouncedSearch,
                category: category !== "All" ? category : ""
            });

            const end = Date.now();
            setLatency(end - (loadingStart || end));

            if (!res || !res.data) throw new Error("No data received from API");

            // Merge materials + suppliers
            const materialsArr = Array.isArray(res.materials) ? res.materials : [];
            const suppliersArr = Array.isArray(res.suppliers) ? res.suppliers : [];
            const enriched = res.data.map(ms => {
                const material = materialsArr.find(m => m._id === ms.materialId);
                const supplier = suppliersArr.find(s => s._id === ms.supplierId);
                return {
                    ...ms,
                    materialName: material?.name || "Unknown Material",
                    category: material?.category || "Uncategorized",
                    supplierName: supplier?.name || "Unknown Supplier",
                };
            });

            setData(enriched);
            setPages(res.pages);
            setTotalItems(res.total);

            // Unique categories from enriched data
            const cats = [...new Set(enriched.map(e => e.category).filter(Boolean))];
            setCategories(prev => (prev.length ? prev : ["All", ...cats]));
        } catch (err) {
            console.error("❌ Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, category, limit, loadingStart]);

    // Run fetch on change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Live latency updater while loading
    useEffect(() => {
        let interval;
        if (loading && loadingStart) {
            interval = setInterval(() => {
                setLatency(Date.now() - loadingStart);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [loading, loadingStart]);

    // Handlers
    const goToPage = (newPage) => setPage(newPage);

    const handleSearchChange = e => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        setPage(1);
    };

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setCategory("All");
        setPage(1);
    };

    const paginatedData = data;

    return (
        <div className="p-4 relative">
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm mx-4">
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-16 h-16 border-4 border-blue-100 rounded-full animate-ping"></div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h3>
                            <p className="text-sm text-gray-600 text-center">
                                {page > 1 ? `Loading page ${page} of ${pages}` : 'Fetching materials and suppliers...'}
                            </p>
                            {latency !== null && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Elapsed: {latency} ms
                                </p>
                            )}
                            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filters */}
            <SearchFilters
                search={search}
                onSearchChange={handleSearchChange}
                onClearFilters={clearFilters}
                categories={categories}
                category={category}
                onCategoryChange={handleCategoryChange}
            />

            {!loading && (
                <>
                    <div className="mb-4 text-sm text-gray-600">
                        Showing {paginatedData.length} of {totalItems.toLocaleString()} total relationships
                        {search && ` (filtered by "${search}")`}
                        {category !== "All" && ` (category: ${category})`}
                        {latency !== null && (
                            <span className="ml-2 text-gray-500">• Fetched in {latency} ms</span>
                        )}
                    </div>
                    <PriceTable data={paginatedData} />

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex justify-center mt-4 gap-2 flex-wrap items-center">
                            <button
                                onClick={() => goToPage(Math.max(page - 1, 1))}
                                disabled={page === 1}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {Array.from({ length: pages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === pages || Math.abs(p - page) <= 2)
                                .map((p, idx, arr) => {
                                    const prev = arr[idx - 1];
                                    return (
                                        <React.Fragment key={p}>
                                            {prev && p - prev > 1 && <span className="px-2">...</span>}
                                            <button
                                                onClick={() => goToPage(p)}
                                                className={`px-3 py-1 rounded ${page === p
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-200 hover:bg-gray-300"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        </React.Fragment>
                                    );
                                })}

                            <button
                                onClick={() => goToPage(Math.min(page + 1, pages))}
                                disabled={page === pages}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PricesPage;
