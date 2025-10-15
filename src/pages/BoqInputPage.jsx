import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import BoqFormModal from "../components/BoqFormModal";
import { API_BASE_URL } from "../config/api";


function BoqInputPage() {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [filters, setFilters] = useState({ itemNo: "", description: "", subDescription: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [rateList, setRateList] = useState([]); // New state for fetched rate list

    // Fetch BOQ items from backend
    useEffect(() => {
        const fetchBoq = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`${API_BASE_URL}/boqItems`);
                setItems(res.data);
            } catch (err) {
                setError("Failed to fetch BOQ items");
            } finally {
                setLoading(false);
            }
        };
        fetchBoq();
    }, []);

    // Fetch Rate list from backend
    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/rates`);
                setRateList(res.data.data || []); // Assuming rates are in res.data.data
            } catch (err) {
                console.error("Failed to fetch rate list:", err);
            }
        };
        fetchRates();
    }, []); // Empty dependency array to fetch once on mount

    const handleAdd = () => {
        setEditIndex(null);
        setShowModal(true);
    };

    const handleEdit = (id) => {
        setEditIndex(items.findIndex((item) => item._id === id));
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`${API_BASE_URL}/boqItems/${id}`);
                // Re-fetch data after successful deletion
                const res = await axios.get(`${API_BASE_URL}/boqItems`);
                setItems(res.data);
            } catch (err) {
                setError("Failed to delete BOQ item");
            }
        }
    };

    const handleSave = async (newItem) => {
        try {
            if (newItem._id) {
                // Update existing item
                await axios.patch(`${API_BASE_URL}/boqItems/${newItem._id}`, newItem);
            } else {
                // Add new item
                await axios.post(`${API_BASE_URL}/boqItems`, newItem);
            }
            // Refresh data
            const res = await axios.get(`${API_BASE_URL}/boqItems`);
            setItems(res.data);
        } catch (err) {
            setError("Failed to save BOQ item");
        }
        setShowModal(false);
    };

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter(
            (i) =>
                i.itemNo.toLowerCase().includes(filters.itemNo.toLowerCase()) &&
                i.description.toLowerCase().includes(filters.description.toLowerCase()) &&
                (i.subDescription || "").toLowerCase().includes(filters.subDescription.toLowerCase())
        );
    }, [items, filters]);

    // Group items
    const groupedItems = useMemo(() => {
        const groups = {};
        filteredItems.forEach((i) => {
            if (!groups[i.itemNo]) {
                groups[i.itemNo] = {
                    mainItem: { itemNo: i.itemNo, description: i.description },
                    subItems: [],
                    subtotal: 0,
                };
            }
            groups[i.itemNo].subItems.push(i);
            groups[i.itemNo].subtotal += i.rate * (i.quantity || 0);
        });
        return groups;
    }, [filteredItems]);

    // Flatten groups
    const allItems = useMemo(() => {
        const all = [];
        const sortedItemNos = Object.keys(groupedItems).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

        sortedItemNos.forEach((itemNo) => {
            const group = groupedItems[itemNo];
            all.push({ ...group.mainItem, isMain: true });

            // Sort sub-items by subItemNo
            const sortedSubItems = group.subItems.sort((a, b) => {
                const aNum = parseInt(a.subItemNo.split("-")[1], 10);
                const bNum = parseInt(b.subItemNo.split("-")[1], 10);
                return aNum - bNum;
            });

            sortedSubItems.forEach((s) => all.push({ ...s, isMain: false }));
            all.push({ itemNo: itemNo, description: "Subtotal", isSubtotal: true, subtotal: group.subtotal });
        });

        return all;
    }, [groupedItems]);

    const grandTotal = useMemo(
        () => filteredItems.reduce((sum, i) => sum + i.rate * (i.quantity || 0), 0),
        [filteredItems]
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">BOQ Data Entry Page</h1>
                <button
                    onClick={handleAdd}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition flex items-center"
                >
                    <span className="mr-2 text-lg">+</span> Add Item
                </button>
            </div>

            {loading && <div className="mt-4 text-blue-600">Loading...</div>}
            {error && <div className="mt-4 text-red-600">{error}</div>}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["itemNo", "description", "subDescription"].map((key) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                                {key.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                                type="text"
                                name={key}
                                value={filters[key]}
                                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                                placeholder={`Filter by ${key}`}
                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow max-h-[70vh] overflow-y-auto">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md">
                            <tr>
                                {["Item No", "Sub Item No", "Description", "Sub-Description", "Unit", "Qty", "Rate", "Amount", "Actions"].map(
                                    (h) => (
                                        <th
                                            key={h}
                                            className="p-3 text-center text-sm font-bold text-white uppercase tracking-wider border-b border-blue-300"
                                        >
                                            {h}
                                        </th>
                                    )
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {allItems.map((item, idx) => {
                                if (item.isSubtotal) {
                                    return (
                                        <tr key={idx} className="bg-gray-200 font-semibold border-b">
                                            <td colSpan="7" className="p-3 text-right">Subtotal:</td>
                                            <td className="p-3 text-right">{item.subtotal.toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    );
                                }

                                return (
                                    <tr
                                        key={idx}
                                        className={`${item.isMain ? "bg-blue-50 font-semibold" : "hover:bg-gray-50"} border-b`}
                                    >
                                        <td className="p-3">{item.isMain ? item.itemNo : ""}</td>
                                        <td className="p-3">{!item.isMain && item.subItemNo}</td>
                                        <td className="p-3">{item.description}</td>
                                        <td className="p-3">{!item.isMain && item.subDescription}</td>
                                        <td className="p-3 text-center">{!item.isMain && (item.unit || "")}</td>
                                        <td className="p-3 text-right">{!item.isMain && (item.quantity || "")}</td>
                                        <td className="p-3 text-right">{!item.isMain && item.rate.toFixed(2)}</td>
                                        <td className="p-3 text-right font-medium">
                                            {!item.isMain && (item.rate * (item.quantity || 0)).toFixed(2)}
                                        </td>
                                        <td className="p-3 text-center">
                                            {!item.isMain && (
                                                <div className="flex justify-center space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(item._id)
                                                        }
                                                        className="p-1 text-blue-600 hover:text-blue-800"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(item._id)
                                                        }
                                                        className="p-1 text-red-600 hover:text-red-800"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {allItems.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="p-4 text-center text-gray-500">
                                        {items.length === 0 ? "No items yet. Click 'Add Item' to start." : "No items match your filters."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t px-4 py-3 flex justify-between items-center sticky bottom-0 z-10">
                    <span className="text-gray-600 text-sm">
                        Showing {allItems.length} of {filteredItems.length} items
                    </span>
                    <span className="text-lg font-semibold">
                        Grand Total: <span className="text-blue-700">${grandTotal.toFixed(2)}</span>
                    </span>
                </div>
            </div>

            {/* Modal */}
            <BoqFormModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleSave}
                initialData={editIndex !== null ? items[editIndex] : {}} // Pass empty object for new items
                rateList={rateList} // Pass rateList to the modal
            />
        </div>
    );
}

export default BoqInputPage;