import React from "react";

const PriceTable = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return <p className="p-4">No data available.</p>;
    }

    const handleView = item => alert(`View: ${item.product?.name}`);
    const handleEdit = item => alert(`Edit: ${item.product?.name}`);
    const handleDelete = item => alert(`Delete: ${item.product?.name}`);

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 table-auto">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Product Name</th>
                        <th className="border px-4 py-2">Category</th>
                        <th className="border px-4 py-2">UOM</th>
                        <th className="border px-4 py-2">Price</th>
                        <th className="border px-4 py-2">Supplier</th>
                        <th className="border px-4 py-2">Location</th>
                        {/* <th className="border px-4 py-2">Quality Score</th> */}
                        <th className="border px-4 py-2">Observed At</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => {

                        return (
                            <tr key={item._id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{item.materialName || "-"}</td>
                                <td className="border px-4 py-2">{item.category || "-"}</td>
                                <td className="border px-4 py-2">{item.unit || item.product?.canonicalUOM || "-"}</td>
                                <td className="border px-4 py-2">{item.pricePerCanonicalUnit} {item.currency || "USD"} {item.price}</td>
                                <td className="border px-4 py-2">{item.supplierName || "-"}</td>
                                <td className="border px-4 py-2">{item.location || "-"}</td>
                                {/* <td className="border px-4 py-2">{item.qualityScore ?? "-"}</td> */}
                                <td className="border px-4 py-2">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}</td>
                                <td className="border px-4 py-2 space-x-1">
                                    <button onClick={() => handleView(item)} className="bg-blue-500 text-white px-2 py-1 rounded">View</button>
                                    <button onClick={() => handleEdit(item)} className="bg-yellow-400 text-white px-2 py-1 rounded">Edit</button>
                                    <button onClick={() => handleDelete(item)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default PriceTable;
