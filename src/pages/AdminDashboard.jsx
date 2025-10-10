import React, { useState, useEffect } from "react";
import VendorModal from "./VendorModal";
import EnquiryModal from "./EnquiryModal";

export default function AdminDashboard() {
    const categories = [
        "ALUMINIUM WORK", "BRICK WORK", "CONCRETE WORK", "DEMOLISHEN", "DRAINAGE", "EARTHWORK",
        "FINISHING", "FLOORING", "HIRE CHARGES", "LABOUR", "LANDSCAPING", "MARBLE WORK", "MISCELLANEUS",
        "MORTARS", "Material", "Misc", "PILE WORK", "RCC", "REPAIRS", "ROAD WORK", "ROOFING", "SANITARY",
        "STEEL WORK", "STONE WORK", "WATER PROOFING", "WOOD WORK", "ELECTRICAL", "PAINTING", "PLUMBING"
    ];

    const [vendorsOpen, setVendorsOpen] = useState(true);
    const [enquiriesOpen, setEnquiriesOpen] = useState(true);
    const [vendors, setVendors] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [editingEnquiry, setEditingEnquiry] = useState(null);
    const [vendorSearch, setVendorSearch] = useState("");
    const [vendorFilterStatus, setVendorFilterStatus] = useState("all"); // pending, approved

    useEffect(() => {
        // Dummy vendors
        setVendors([
            { id: 1, name: "Akros Supplier", category: ["CONCRETE WORK", "EARTHWORK"], email: "a@supplier.com", phone: "+998901234567", city: "Tashkent", status: "approved" },
            { id: 2, name: "Best Materials", category: ["BRICK WORK", "FINISHING"], email: "b@supplier.com", phone: "+998901234568", city: "Tashkent", status: "pending" },
            { id: 3, name: "QuickBuild", category: ["CONCRETE WORK"], email: "q@build.com", phone: "+998901234569", city: "Tashkent", status: "pending" },
        ]);

        // Dummy enquiries
        setEnquiries([
            { id: 1, title: "Concrete for Building A", category: "CONCRETE WORK", description: "We need concrete grade C30 for Building A", deadline: "2025-10-20", assignedVendors: [1], status: "Open" },
            { id: 2, title: "Bricks for Wall B", category: "BRICK WORK", description: "Bricks for Wall B with standard size", deadline: "2025-10-25", assignedVendors: [2], status: "Open" },
        ]);
    }, []);

    // Filtered vendors for search & status
    const filteredVendors = vendors.filter((v) => {
        const matchesStatus = vendorFilterStatus === "all" || v.status === vendorFilterStatus;
        const matchesSearch = v.name.toLowerCase().includes(vendorSearch.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Vendor Handlers
    const handleSaveVendor = (data) => {
        if (editingVendor) {
            setVendors((prev) =>
                prev.map((v) => (v.id === editingVendor.id ? { ...v, ...data } : v))
            );
        } else {
            const newVendor = { id: Date.now(), status: "pending", ...data };
            setVendors((prev) => [...prev, newVendor]);
        }
        setShowVendorModal(false);
        setEditingVendor(null);
    };

    const handleEditVendor = (vendor) => {
        setEditingVendor(vendor);
        setShowVendorModal(true);
    };

    const handleApproveVendor = (id) => {
        setVendors((prev) =>
            prev.map((v) => (v.id === id ? { ...v, status: "approved" } : v))
        );
    };

    // Enquiry Handlers
    const handleSaveEnquiry = (data) => {
        if (editingEnquiry) {
            setEnquiries((prev) =>
                prev.map((e) => (e.id === editingEnquiry.id ? { ...e, ...data } : e))
            );
        } else {
            const newEnquiry = { id: Date.now(), ...data };
            setEnquiries((prev) => [...prev, newEnquiry]);
        }
        setShowEnquiryModal(false);
        setEditingEnquiry(null);
    };

    const handleEditEnquiry = (enquiry) => {
        setEditingEnquiry(enquiry);
        setShowEnquiryModal(true);
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-6">
                <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
                <nav className="space-y-3">
                    <button onClick={() => setShowVendorModal(true)} className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">Add Vendor</button>
                    <button onClick={() => setShowEnquiryModal(true)} className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">Add Enquiry</button>
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">Dashboard Overview</button>
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">Reports</button>
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-700">Settings</button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 space-y-8">

                {/* Vendors Section */}
                <section className="bg-white rounded-xl p-6 shadow">
                    <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setVendorsOpen(!vendorsOpen)}>
                        <h2 className="text-xl font-semibold">Vendors Pending Approval</h2>
                        <span className="text-gray-500">{vendorsOpen ? "▼" : "►"}</span>
                    </div>

                    {vendorsOpen && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Search vendor..."
                                    value={vendorSearch}
                                    onChange={(e) => setVendorSearch(e.target.value)}
                                    className="border rounded px-3 py-1"
                                />
                                <select
                                    value={vendorFilterStatus}
                                    onChange={(e) => setVendorFilterStatus(e.target.value)}
                                    className="border rounded px-3 py-1"
                                >
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                </select>
                            </div>

                            <ul className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredVendors.map((v) => (
                                    <li key={v.id} className="flex justify-between p-3 border rounded hover:bg-gray-50 transition">
                                        <div>
                                            <p className="font-medium">{v.name}</p>
                                            <p className="text-sm text-gray-500">{v.category.join(", ")}</p>
                                            <p className="text-sm text-gray-500">{v.email} | {v.phone} | {v.city}</p>
                                            <p className="text-sm text-gray-500">Status: {v.status}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            {v.status === "pending" && (
                                                <button onClick={() => handleApproveVendor(v.id)} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Approve</button>
                                            )}
                                            <button onClick={() => handleEditVendor(v)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Edit</button>
                                        </div>
                                    </li>
                                ))}
                                {filteredVendors.length === 0 && <p className="text-gray-500">No vendors found.</p>}
                            </ul>
                        </>
                    )}
                </section>

                {/* Live Enquiries Section */}
                <section className="bg-white rounded-xl p-6 shadow">
                    <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setEnquiriesOpen(!enquiriesOpen)}>
                        <h2 className="text-xl font-semibold">Live Enquiries</h2>
                        <span className="text-gray-500">{enquiriesOpen ? "▼" : "►"}</span>
                    </div>

                    {enquiriesOpen && (
                        <ul className="space-y-3 max-h-96 overflow-y-auto">
                            {enquiries.map((e) => (
                                <li key={e.id} className="p-4 border rounded bg-gray-50 hover:bg-white transition shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-gray-800">{e.title}</h3>
                                        <button onClick={() => handleEditEnquiry(e)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit</button>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1"><strong>Category:</strong> {e.category}</p>
                                    <p className="text-sm text-gray-600 mb-1"><strong>Description:</strong> {e.description}</p>
                                    <p className="text-sm text-gray-600 mb-1"><strong>Deadline:</strong> {e.deadline}</p>
                                    <p className="text-sm text-gray-600"><strong>Assigned Vendors:</strong> {vendors.filter(v => e.assignedVendors.includes(v.id)).map(v => v.name).join(", ")}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            {/* Modals */}
            <VendorModal
                show={showVendorModal}
                onClose={() => { setShowVendorModal(false); setEditingVendor(null); }}
                onSave={handleSaveVendor}
                initialData={editingVendor}
                categories={categories}
            />

            <EnquiryModal
                show={showEnquiryModal}
                onClose={() => { setShowEnquiryModal(false); setEditingEnquiry(null); }}
                onSave={handleSaveEnquiry}
                initialData={editingEnquiry}
                vendors={vendors}
                categories={categories}
            />
        </div>
    );
}
