import { useEffect, useState } from "react";

// Dummy data for initial testing
const dummyEnquiries = [
    {
        _id: "1",
        materialName: "Cement",
        description: "High-quality cement for construction",
        category: "CONCRETE WORK",
        quotes: [],
    },
    {
        _id: "2",
        materialName: "Steel Rods",
        description: "TMT steel rods, 12mm diameter",
        category: "STEEL WORK",
        quotes: [],
    },
    {
        _id: "3",
        materialName: "Paint",
        description: "Exterior wall paint, 20L",
        category: "FINISHING",
        quotes: [],
    },
];

export default function SupplierEnterPrice() {
    const [enquiries, setEnquiries] = useState([]);
    const [categories] = useState([
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
        "WOOD WORK",
    ]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeEnquiry, setActiveEnquiry] = useState(null); // modal active enquiry
    const [rate, setRate] = useState("");
    const [unit, setUnit] = useState("");
    const [per, setPer] = useState("1");

    const supplierName = "Akros Supplier"; // example supplier

    // Load dummy data initially
    useEffect(() => {
        setEnquiries(dummyEnquiries);
    }, []);

    // Filtered enquiries by category & excluding already quoted
    const filteredEnquiries = enquiries.filter(
        (e) =>
            (selectedCategory === "All" || e.category === selectedCategory) &&
            (!e.quotes || !e.quotes.some((q) => q.supplierName === supplierName))
    );

    const handleQuoteSubmit = (enquiryId) => {
        if (!rate || !unit) {
            alert("Please fill in rate and unit.");
            return;
        }

        // Simulate API call
        const updatedEnquiries = enquiries.map((e) => {
            if (e._id === enquiryId) {
                return {
                    ...e,
                    quotes: [...(e.quotes || []), { supplierName, rate, unit, per }],
                };
            }
            return e;
        });
        setEnquiries(updatedEnquiries);
        alert(`✅ Quote submitted for enquiry ${enquiryId}`);
        closeModal();
    };

    const handleReject = (enquiryId) => {
        const comment = prompt("Enter reason for rejection:");
        if (!comment) return alert("Rejection comment required.");

        // Simulate API call
        const updatedEnquiries = enquiries.filter((e) => e._id !== enquiryId);
        setEnquiries(updatedEnquiries);
        alert(`❌ Enquiry rejected: ${comment}`);
        closeModal();
    };

    const openModal = (enquiry) => {
        setActiveEnquiry(enquiry);
        setRate("");
        setUnit("");
        setPer("1");
    };

    const closeModal = () => setActiveEnquiry(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 flex flex-col items-center">
            <h1 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
                💰 Supplier Enquiries
            </h1>

            {/* Category Selector */}
            <div className="w-full max-w-xl mb-6">
                <label className="block text-gray-700 font-medium mb-2">Category</label>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Enquiry List */}
            <div className="w-full max-w-xl flex flex-col gap-4">
                {filteredEnquiries.length === 0 ? (
                    <p className="text-gray-500">No enquiries available for this category.</p>
                ) : (
                    filteredEnquiries.map((enquiry) => (
                        <div
                            key={enquiry._id}
                            className="p-4 border border-gray-200 rounded-lg shadow hover:shadow-lg cursor-pointer bg-white transition"
                            onClick={() => openModal(enquiry)}
                        >
                            <h2 className="font-semibold text-gray-700">{enquiry.materialName}</h2>
                            <p className="text-gray-600 text-sm">{enquiry.description}</p>
                            <p className="text-gray-500 text-xs mt-1">Category: {enquiry.category}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {activeEnquiry && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold mb-4 text-gray-700">
                            {activeEnquiry.materialName}
                        </h2>
                        <p className="text-gray-600 mb-4">{activeEnquiry.description}</p>
                        <p className="text-gray-500 mb-4">Category: {activeEnquiry.category}</p>

                        <div className="flex flex-col gap-2 mb-4">
                            <input
                                type="number"
                                placeholder="Rate"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Per"
                                value={per}
                                onChange={(e) => setPer(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(activeEnquiry._id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleQuoteSubmit(activeEnquiry._id)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Submit Quote
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
