import { useState, useEffect } from "react";
import VendorModal from "./VendorModal";
import EnquiryModal from "./EnquiryModal";

export default function AdminDashboard() {
    const categories = [
        "ALUMINIUM WORK", "BRICK WORK", "CONCRETE WORK", "DEMOLISHEN", "DRAINAGE", "EARTHWORK",
        "FINISHING", "FLOORING", "HIRE CHARGES", "LABOUR", "LANDSCAPING", "MARBLE WORK", "MISCELLANEUS",
        "MORTARS", "Material", "Misc", "PILE WORK", "RCC", "REPAIRS", "ROAD WORK", "ROOFING", "SANITARY",
        "STEEL WORK", "STONE WORK", "WATER PROOFING", "WOOD WORK", "ELECTRICAL", "PAINTING", "PLUMBING"
    ];

    const [vendorsOpen, setVendorsOpen] = useState(false);
    const [enquiriesOpen, setEnquiriesOpen] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [enquiries, setEnquiries] = useState([]);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [showEnquiryModal, setShowEnquiryModal] = useState(false);
    const [editingEnquiry, setEditingEnquiry] = useState(null);
    const [vendorSearch, setVendorSearch] = useState("");
    const [vendorFilterStatus, setVendorFilterStatus] = useState("all"); // pending, approved



    useEffect(() => {
        fetchSuppliers();
        fetchEnquiries();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/suppliers");

            const data = await res.json();

            setVendors(
                data.map((s) => ({
                    _id: s._id || s.__id,
                    __id: s.__id || s._id,
                    name: s.name,
                    category: s.certifications || [],
                    email: s.contact?.email || "",
                    phone: s.contact?.phone || "",
                    city: s.location?.city || "",
                    country: s.location?.country || s.country || "",
                    status: s.status || "pending",
                }))
            );
        } catch (err) {
            console.error("❌ Error fetching suppliers:", err);
        }
    };

    const fetchEnquiries = async () => {
        try {

            const res = await fetch("http://localhost:4000/api/enquiries");


            const result = await res.json();


            // ✅ Extract correct array
            const enquiriesArray = result?.data || [];

            if (!Array.isArray(enquiriesArray)) {
                console.error("❌ [ERROR] Expected 'data' to be an array but got:", typeof enquiriesArray);
                return;
            }



            setEnquiries(
                enquiriesArray.map((e) => ({
                    _id: e._id || e.__id || e.id,
                    title: e.title,
                    category: e.category,
                    city: e.city,
                    description: e.description,
                    deadline: e.deadline,
                    assignedVendors: e.assignedVendors || [],
                    status: e.status || "Open",
                }))
            );


        } catch (err) {
            console.error("❌ [ERROR] Fetching enquiries failed:", err);
        }
    };

    // Filtered vendors for search & status
    const filteredVendors = vendors.filter((v) => {
        const matchesStatus = vendorFilterStatus === "all" || v.status === vendorFilterStatus;
        const matchesSearch = v.name.toLowerCase().includes(vendorSearch.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleSaveVendor = async (data) => {
        try {
            const _id = data._id || data.__id;

            // ✅ Build FormData
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("contact[email]", data.contact.email);
            formData.append("contact[phone]", data.contact.phone);
            formData.append("location[city]", data.location.city);
            formData.append("location[country]", data.location.country);
            data.category.forEach((cat) => formData.append("category", cat));

            // ✅ Add certifications (if any)
            if (data.certifications && Array.isArray(data.certifications)) {
                data.certifications.forEach((file) => {
                    formData.append("certifications", file);
                });
            }

            // ✅ Send FormData request (do NOT set Content-Type)
            const url = _id
                ? `http://localhost:4000/api/suppliers/${_id}`
                : "http://localhost:4000/api/suppliers";

            const method = _id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: formData, // <-- no JSON.stringify
            });

            if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

            await fetchSuppliers();
            setShowVendorModal(false);
            setEditingVendor(null);
        } catch (err) {
            console.error("❌ Error saving supplier:", err);
        }
    };




    const handleApproveVendor = async (_id) => {


        try {
            // Step 1: Build request data
            const payload = { status: "approved" };


            // Step 2: Make PUT request
            const response = await fetch(`http://localhost:4000/api/suppliers/${_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });



            // Step 3: Parse response
            const data = await response.json();


            if (!response.ok) {
                throw new Error(`Failed to approve vendor: ${data.error || response.statusText}`);
            }

            // Step 4: Refresh suppliers list

            await fetchSuppliers();


        } catch (err) {
            console.error("❌ [ERROR] Approving vendor failed:", err);
        }


    };

    const handleEditVendor = (vendor) => {
        // Convert MongoDB __id to _id for consistency
        setEditingVendor({ ...vendor, _id: vendor.__id });
        setShowVendorModal(true);
    };

    // Enquiry Handlers
    const handleSaveEnquiry = (data) => {


        if (editingEnquiry) {
            // console.log("🔁 [MODE] Update existing enquiry");

            setEnquiries((prev) => {
                const updated = prev.map((e) =>
                    e._id === editingEnquiry._id ? { ...e, ...data } : e
                );
                return updated;
            });
        } else {

            const newEnquiry = { _id: Date.now(), ...data };

            setEnquiries((prev) => {
                const updated = [...prev, newEnquiry];
                return updated;
            });
        }

        setShowEnquiryModal(false);
        setEditingEnquiry(null);


    };


    const handleEditEnquiry = (enquiry) => {
        setEditingEnquiry(enquiry);
        setShowEnquiryModal(true);
    };

    const handleDeleteVendor = async (vendor_id) => {


        if (!vendor_id) return alert("❌ Vendor _id missing");

        if (window.confirm(`Are you sure you want to delete this vendor?`)) {

            try {
                const res = await fetch(`http://localhost:4000/api/suppliers/${vendor_id}`, {
                    method: "DELETE",
                });

                if (!res.ok) throw new Error("Failed to delete vendor");

                alert("✅ Vendor deleted successfully!");
                await fetchSuppliers();
                setShowVendorModal(false);
                setEditingVendor(null);
            } catch (err) {
                console.error("❌ Error deleting vendor:", err);
                alert("Failed to delete vendor.");
            }
        }
    };




    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* S_idebar */}
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
                                {filteredVendors.map((v) => {
                                    return (
                                        <li
                                            key={v._id} // fixed from __id to _id
                                            className="flex justify-between p-3 border rounded hover:bg-gray-50 transition"
                                        >
                                            <div>
                                                <p className="font-medium">{v.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {Array.isArray(v.category) ? v.category.join(", ") : v.category}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {v.email} | {v.phone} | {v.city}
                                                </p>
                                                <p className="text-sm text-gray-500">Status: {v.status}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                {v.status === "pending" && (
                                                    <button
                                                        onClick={() => handleApproveVendor(v._id)}
                                                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditVendor(v)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}

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
                            {enquiries.map((e, idx) => (
                                <li
                                    key={e._id || `enquiry-${idx}`}
                                    className="p-4 border rounded bg-gray-50 hover:bg-white transition shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold text-gray-800">{e.title}</h3>
                                        <button
                                            onClick={() => handleEditEnquiry(e)}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                        >
                                            Edit
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-1">
                                        <strong>Category:</strong> {e.category}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <strong>Description:</strong> {e.description}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">
                                        <strong>Deadline:</strong> {e.deadline}
                                    </p>

                                    <p className="text-sm text-gray-600">
                                        <strong>Assigned Vendors:</strong>{" "}
                                        {Array.isArray(e.assignedVendors) && e.assignedVendors.length > 0 ? (
                                            e.assignedVendors.map((v, i) => (
                                                <span key={v._id || v.__id || `${e._id || idx}-vendor-${i}`}>
                                                    {v.name}
                                                    {v.location?.city ? ` (${v.location.city})` : ""}
                                                    {i < e.assignedVendors.length - 1 ? ", " : ""}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400">No vendors assigned</span>
                                        )}
                                    </p>
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
                onDelete={handleDeleteVendor}
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
