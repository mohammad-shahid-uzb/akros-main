import { useState, useEffect } from "react";
import VendorModal from "./VendorModal";
import EnquiryModal from "./EnquiryModal";
import QuotesModal from "./QuotesModal";

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
    const [vendorFilterStatus, setVendorFilterStatus] = useState("all");
    const [selectedEnquiryQuotes, setSelectedEnquiryQuotes] = useState([]);
    console.log(selectedEnquiryQuotes);
    const [showQuotesModal, setShowQuotesModal] = useState(false);
    const [sendingId, setSendingId] = useState(null);
    useEffect(() => {
        fetchSuppliers();
        fetchEnquiries();
    }, []);
    const fetchSuppliers = async () => {
        try {
            const res = await fetch("https://green-book-server-production.up.railway.app/api/suppliers");
            const data = await res.json();
            //console.log("data", data);
            setVendors(
                data.map((s) => {
                    // Normalize category (convert objects or mixed arrays to strings)
                    const category = Array.isArray(s.category)
                        ? s.category.map((c) =>
                            typeof c === "string"
                                ? c
                                : c.name || c.category || JSON.stringify(c)
                        )
                        : [];

                    // Normalize certifications
                    const certifications = Array.isArray(s.certifications)
                        ? s.certifications.map((c) => ({
                            fileName: c.fileName || "",
                            fileType: c.fileType || "",
                            fileUrl: c.fileUrl || "",
                            uploadedAt: c.uploadedAt || "",
                        }))
                        : [];

                    return {
                        _id: s._id || s.__id,
                        __id: s.__id || s._id,
                        name: s.name,
                        category,
                        email: s.contact?.email || "",
                        phone: s.contact?.phone || "",
                        city: s.location?.city || "",
                        country: s.location?.country || s.country || "",
                        status: s.status || "pending",
                        certifications, // ✅ now included
                        activityLog: Array.isArray(s.activityLog) ? s.activityLog : [],
                        credibilityScore: s.credibilityScore || 0,
                    };
                })
            );
        } catch (err) {
            console.error("Error fetching suppliers:", err);
        }
    };
    const fetchEnquiries = async () => {
        try {

            const res = await fetch("https://green-book-server-production.up.railway.app/api/enquiries");


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
                ? `https://green-book-server-production.up.railway.app/api/suppliers/${_id}`
                : "https://green-book-server-production.up.railway.app/api/suppliers";

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
            const response = await fetch(`https://green-book-server-production.up.railway.app/api/suppliers/${_id}`, {
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
    const handleSaveEnquiry = async () => {
        // After create/update inside EnquiryModal, refresh from backend to reflect latest state
        await fetchEnquiries();
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
                const res = await fetch(`https://green-book-server-production.up.railway.app/api/suppliers/${vendor_id}`, {
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
    const handleViewQuotes = async (enquiryId) => {
        try {
            const res = await fetch(`https://green-book-server-production.up.railway.app/api/quotes/enquiry/${enquiryId}`);
            const result = await res.json();

            if (!result.success) throw new Error(result.message || "Failed to fetch quotes");

            setSelectedEnquiryQuotes(result.data || []);
            setShowQuotesModal(true);
        } catch (err) {
            console.error("❌ Error fetching quotes:", err);
            alert("Failed to fetch quotes");
        }
    };
    const handleSendWinningQuotes = async (enquiryId, selectedEnquiryQuotes) => {
        console.log(enquiryId, selectedEnquiryQuotes);
        setSendingId(enquiryId);
        try {
            let quotesToSend = Array.isArray(selectedEnquiryQuotes) && selectedEnquiryQuotes.length > 0
                ? selectedEnquiryQuotes
                : null;

            if (!quotesToSend) {
                // Fallback: fetch quotes for this enquiry if state is empty
                const resQuotes = await fetch(`https://green-book-server-production.up.railway.app/api/quotes/enquiry/${enquiryId}`);
                const resultQuotes = await resQuotes.json();
                quotesToSend = resultQuotes?.data || [];
            }

            console.log("quotesToSend", quotesToSend);
            if (!Array.isArray(quotesToSend) || quotesToSend.length === 0) {
                alert("No quotes found for this enquiry to send.");
                return;
            }

            const payloadQuotes = quotesToSend.map((q) => ({
                id: q._id || q.id,
                vendorId: (q.vendorId && (q.vendorId._id || q.vendorId.__id || q.vendorId.id)) || q.vendorId,
                price: q.price,
                notes: q.notes || "",
            }));
            console.log(payloadQuotes);
            const res = await fetch(`https://green-book-server-production.up.railway.app/api/enquiries/${enquiryId}/sendWinningQuotes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quotes: payloadQuotes }),
            });
            const data = await res.json();
            console.log(res);
            if (data.success) {
                alert("🏆 Winning quotes sent successfully!");
            } else {
                alert(`⚠️ Failed to send: ${data.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error sending winning quotes:", err);
            alert("❌ Error sending winning quotes");
        } finally {
            setSendingId(null);
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
                <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    {/* Header */}
                    <div
                        className="flex justify-between items-center mb-5 cursor-pointer select-none"
                        onClick={() => setVendorsOpen(!vendorsOpen)}
                    >
                        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-blue-600">📋</span> Vendors Pending Approval
                        </h2>
                        <span className="text-gray-500 text-lg transition-transform">
                            {vendorsOpen ? "▼" : "►"}
                        </span>
                    </div>

                    {vendorsOpen && (
                        <>
                            {/* Search + Filter */}
                            <div className="flex flex-wrap justify-between items-center mb-5 gap-3">
                                <input
                                    type="text"
                                    placeholder="🔍 Search vendor..."
                                    value={vendorSearch}
                                    onChange={(e) => setVendorSearch(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                                <select
                                    value={vendorFilterStatus}
                                    onChange={(e) => setVendorFilterStatus(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                </select>
                            </div>

                            {/* Vendor List */}
                            <ul className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                                {filteredVendors.map((v) => {
                                    const score = v.credibilityScore || 0;

                                    // Convert score (0–100) → 1–5 stars
                                    const starCount = Math.max(1, Math.round(score / 20));

                                    // Gradient color for bar (red → yellow → green)
                                    const gradient = `linear-gradient(to right, #ef4444, #f59e0b, #22c55e ${score}%)`;

                                    return (
                                        <li
                                            key={v._id}
                                            className="flex justify-between items-start p-4 border border-gray-200 rounded-xl hover:shadow-md hover:bg-gray-50 transition-all"
                                        >
                                            <div className="w-full pr-6">
                                                {/* Vendor Name + Stars */}
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium text-lg text-gray-800">{v.name}</p>
                                                    <div className="flex space-x-1 text-yellow-400 text-lg">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i}>
                                                                {i < starCount ? "★" : "☆"}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Gradient Score Bar */}
                                                <div className="mt-2 w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                                                    <div
                                                        className="h-2 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(score, 100)}%`,
                                                            backgroundImage: gradient,
                                                        }}
                                                    ></div>
                                                </div>

                                                {/* Vendor Info */}
                                                <p className="text-sm text-gray-500 mt-2">
                                                    {Array.isArray(v.category)
                                                        ? v.category.join(", ")
                                                        : v.category}
                                                </p>
                                                <p className="text-sm text-gray-600 mb-1">
                                                    {v.email} | {v.phone} | {v.city}
                                                </p>

                                                {/* Certifications */}
                                                {v.certifications && v.certifications.length > 0 ? (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-semibold text-gray-700">
                                                            Certifications:
                                                        </p>
                                                        <ul className="ml-4 list-disc text-sm text-blue-600">
                                                            {v.certifications.map((c, i) => (
                                                                <li key={i}>
                                                                    <a
                                                                        href={`https://green-book-server-production.up.railway.app${c.fileUrl}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="underline hover:text-blue-800"
                                                                    >
                                                                        {c.fileName || `Certification ${i + 1}`}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic mt-1">
                                                        No certifications uploaded
                                                    </p>
                                                )}

                                                <p className="text-sm text-gray-500 mt-2">
                                                    Activity Log:{" "}
                                                    <span className="font-medium text-gray-700">
                                                        {Array.isArray(v.activityLog)
                                                            ? v.activityLog.length
                                                            : 0}
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Status:{" "}
                                                    <span
                                                        className={`font-semibold ${v.status === "approved"
                                                            ? "text-green-600"
                                                            : v.status === "pending"
                                                                ? "text-yellow-600"
                                                                : "text-gray-600"
                                                            }`}
                                                    >
                                                        {v.status}
                                                    </span>
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col space-y-2 ml-4">
                                                {v.status === "pending" && (
                                                    <button
                                                        onClick={() => handleApproveVendor(v._id)}
                                                        className="px-4 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEditVendor(v)}
                                                    className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}

                                {filteredVendors.length === 0 && (
                                    <p className="text-center text-gray-500 py-5">No vendors found.</p>
                                )}
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
                                            <span>
                                                {(() => {
                                                    const seenIds = new Set();
                                                    const labels = [];
                                                    for (const entry of e.assignedVendors) {
                                                        const vendorId = typeof entry === "string"
                                                            ? entry
                                                            : (entry?._id || entry?.__id || entry?.id);
                                                        if (!vendorId || seenIds.has(vendorId)) continue;
                                                        seenIds.add(vendorId);
                                                        const vendorObj =
                                                            (entry && typeof entry === "object" && (entry.name || entry.location))
                                                                ? entry
                                                                : vendors.find((vv) =>
                                                                    vv._id === vendorId || vv.__id === vendorId || vv.id === vendorId
                                                                );
                                                        if (!vendorObj) continue;
                                                        const cityName = vendorObj.location?.city || vendorObj.city || "";
                                                        labels.push(`${vendorObj.name}${cityName ? ` (${cityName})` : ""}`);
                                                    }
                                                    return labels.join(", ");
                                                })()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">No vendors assigned</span>
                                        )}
                                    </p>
                                    <button
                                        onClick={() => handleViewQuotes(e._id)}
                                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                    >
                                        View Quotes
                                    </button>
                                    {/* 🏆 Send Winning Quotes Button */}
                                    <button
                                        onClick={() => handleSendWinningQuotes(e._id, selectedEnquiryQuotes)}
                                        disabled={sendingId === e._id}
                                        className={`px-3 py-1 text-white text-sm rounded transition ${sendingId === e._id
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                            }`}
                                    >
                                        {sendingId === e._id ? "Sending..." : "Send to User 🏆"}
                                    </button>
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
            <QuotesModal
                show={showQuotesModal}
                onClose={() => setShowQuotesModal(false)}
                quotes={selectedEnquiryQuotes}
            />
        </div>
    );
}
