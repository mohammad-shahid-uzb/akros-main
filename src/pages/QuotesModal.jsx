import React from "react";

export default function QuotesModal({ show, onClose, quotes }) {
    if (!show) return null;

    // Sort by lowest price for comparison
    const sortedQuotes = [...quotes].sort((a, b) => a.price - b.price);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative">
                <h2 className="text-2xl font-semibold mb-4">Vendor Quotes Comparison</h2>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
                >
                    ✖
                </button>

                {sortedQuotes.length === 0 ? (
                    <p className="text-gray-500">No quotes submitted yet.</p>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="py-2 px-3 border-b">Vendor</th>
                                <th className="py-2 px-3 border-b">City</th>
                                <th className="py-2 px-3 border-b">Price (USD)</th>
                                <th className="py-2 px-3 border-b">Notes</th>
                                <th className="py-2 px-3 border-b">Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedQuotes.map((q) => (
                                <tr key={q._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-3 border-b">{q.vendorId?.name || "Unknown"}</td>
                                    <td className="py-2 px-3 border-b">{q.vendorId?.location?.city || "—"}</td>
                                    <td className="py-2 px-3 border-b text-green-600 font-semibold">
                                        ${q.price.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-3 border-b text-gray-700">{q.notes || "—"}</td>
                                    <td className="py-2 px-3 border-b text-blue-600 font-medium">
                                        {q.vendorId?.credibilityScore || 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
