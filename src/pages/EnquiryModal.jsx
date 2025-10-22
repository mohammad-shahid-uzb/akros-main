import React, { useState, useEffect, useMemo, useCallback } from "react";


const dummyPastSelections = [
    { vendorId: 1, category: "PLUMBING", city: "Tashkent" },
    { vendorId: 3, category: "PLUMBING", city: "Samarkand" },
    { vendorId: 1, category: "PLUMBING", city: "Tashkent" },
    { vendorId: 2, category: "ELECTRICAL", city: "Tashkent" },
];

const DEFAULT_CATEGORIES = ["PLUMBING", "ELECTRICAL", "Carpentry"];

// API Service for database operations
const API_BASE = "http://localhost:4000";

const apiService = {
    // Save enquiry to database
    async saveEnquiry(enquiryData) {
        console.log('[EnquiryModal] saveEnquiry — request', { enquiryData });
        try {
            const response = await fetch(`${API_BASE}/api/enquiries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enquiryData),
            });

            if (!response.ok) {
                throw new Error('Failed to save enquiry');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving enquiry:', error);
            throw error;
        }
    },

    // Update existing enquiry
    async updateEnquiry(enquiryId, enquiryData) {
        try {
            console.log('[EnquiryModal] updateEnquiry — request', { enquiryId, enquiryData });
            const response = await fetch(`${API_BASE}/api/enquiries/${enquiryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(enquiryData),
            });

            console.log('[EnquiryModal] updateEnquiry — status', response.status);
            let json;
            try {
                json = await response.json();
            } catch (e) {
                console.warn('[EnquiryModal] updateEnquiry — failed to parse JSON');
                json = null;
            }
            console.log('[EnquiryModal] updateEnquiry — response JSON', json);

            if (!response.ok) {
                throw new Error(json?.error || 'Failed to update enquiry');
            }

            return json;
        } catch (error) {
            console.error('Error updating enquiry:', error);
            throw error;
        }
    },

    // Send Telegram notifications to vendors
    async sendTelegramNotifications(enquiryData, vendorIds) {
        try {
            const response = await fetch(`${API_BASE}/api/notifications/telegram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vendorIds: vendorIds,      // ✅ use function parameter
                    enquiry: enquiryData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send notifications');
            }

            return await response.json();
        } catch (error) {
            console.error('Error sending Telegram notifications:', error);
            throw error;
        }
    },
}


export default function EnquiryModal({
    show,
    onClose,
    onSave,
    initialData,
    vendors: vendorsFromParent = [],
    categories = DEFAULT_CATEGORIES
}) {

    const [form, setForm] = useState({
        title: "",
        category: "",
        city: "",
        description: "",
        deadline: "",
        assignedVendors: [],
        status: "Open",
    });

    const [vendors, setVendors] = useState([]);
    const [vendorSearch, setVendorSearch] = useState("");
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    // ✅ Normalize any vendor shape (from backend or parent)
    const normalizeVendors = (list) => {
        if (!Array.isArray(list)) return [];
        return list.map((v) => ({
            id: v._id || v.__id || v.id,
            name: v.name,
            category: Array.isArray(v.category) ? v.category : [],
            city: v.location?.city || v.city || "",
            email: v.contact?.email || v.email || "",
            phone: v.contact?.phone || v.phone || "",
            telegramChatId: v.telegramChatId || "",
            status: v.status || "pending",
        })).filter((v) => v.id && v.name);
    };

    // ✅ Fetch vendors when modal opens, or use parent list as fallback
    useEffect(() => {
        if (!show) return;

        // Reset form
        if (initialData) {
            setForm(initialData);
        } else {
            setForm({
                title: "",
                category: "",
                city: "",
                description: "",
                deadline: "",
                assignedVendors: [],
                status: "Open",
            });
        }

        setErrors({});
        setVendorSearch("");
        setSubmitStatus(null);

        // Use parent-provided vendors immediately if available
        const parentNormalized = normalizeVendors(vendorsFromParent);
        if (parentNormalized.length > 0) {
            setVendors(parentNormalized);
        }

        // Fetch latest from backend regardless (will overwrite if successful)
        (async () => {
            try {
                const response = await fetch(`${API_BASE}/api/suppliers`);
                if (!response.ok) throw new Error("Failed to fetch vendors");
                const data = await response.json();
                const normalized = normalizeVendors(data);
                setVendors(normalized);
            } catch (err) {
                if (parentNormalized.length === 0) {
                    setVendors([]);
                }
            }
        })();
    }, [show, initialData, vendorsFromParent]);

    const cities = useMemo(() => {
        return Array.from(new Set(vendors.map((v) => v.city))).sort();
    }, [vendors]);

    const getVendorScore = useCallback((vendor) => {
        let score = 0;
        const { category, city } = form;

        const categoryMatches = dummyPastSelections.filter(
            (s) => s.vendorId === vendor.id && s.category === category
        ).length;
        score += categoryMatches * 5;

        const cityMatches = dummyPastSelections.filter(
            (s) => s.vendorId === vendor.id && s.city === city
        ).length;
        score += cityMatches * 3;

        const searchLower = vendorSearch.toLowerCase();
        if (searchLower && (
            vendor.name.toLowerCase().includes(searchLower) ||
            vendor.email?.toLowerCase().includes(searchLower)
        )) {
            score += 1;
        }

        return score;
    }, [form, vendorSearch]);

    const filteredVendors = useMemo(() => {
        // Start with all vendors
        let filtered = [...vendors];

        // If a category is chosen, filter by category membership
        if (form.category) {
            filtered = filtered.filter((v) => Array.isArray(v.category) && v.category.includes(form.category));
        }

        // Apply text search
        if (vendorSearch) {
            const searchLower = vendorSearch.toLowerCase();
            filtered = filtered.filter((v) =>
                v.name.toLowerCase().includes(searchLower) ||
                v.email?.toLowerCase().includes(searchLower)
            );
        }

        // Sort by score for relevance
        filtered.sort((a, b) => getVendorScore(b) - getVendorScore(a));
        return filtered;
    }, [form.category, vendorSearch, getVendorScore, vendors]);

    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!form.title.trim()) {
            newErrors.title = "Title is required";
        }

        if (!form.category) {
            newErrors.category = "Category is required";
        }

        if (!form.description.trim()) {
            newErrors.description = "Description is required";
        }

        if (!form.deadline) {
            newErrors.deadline = "Deadline is required";
        } else {
            const deadlineDate = new Date(form.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (deadlineDate < today) {
                newErrors.deadline = "Deadline must be today or in the future";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [errors]);

    const toggleVendorSelection = useCallback((vendorId) => {
        setForm((prev) => ({
            ...prev,
            assignedVendors: prev.assignedVendors.includes(vendorId)
                ? prev.assignedVendors.filter((id) => id !== vendorId)
                : [...prev.assignedVendors, vendorId],
        }));
    }, []);

    const handleSubmit = useCallback(async () => {

        // Step 0: Validate form
        if (!validateForm()) {

            return;
        }


        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            let savedEnquiry;

            // Step 1: Save to database (Create or Update)
            const enquiryId = initialData?._id || initialData?.id;

            if (enquiryId) {

                savedEnquiry = await apiService.updateEnquiry(enquiryId, form);

                setSubmitStatus({ type: 'success', message: 'Enquiry updated successfully!' });
            } else {

                savedEnquiry = await apiService.saveEnquiry(form);

                setSubmitStatus({ type: 'success', message: 'Enquiry created successfully!' });
            }

            // Step 2: Send Telegram notifications (if vendors assigned)
            if (form.assignedVendors.length > 0) {


                await apiService.sendTelegramNotifications(savedEnquiry, form.assignedVendors);


                setSubmitStatus({
                    type: 'success',
                    message: `Enquiry saved and notifications sent to ${form.assignedVendors.length} vendor(s)!`
                });
            } else {

            }

            // Step 3: Post-success actions

            setTimeout(() => {

                onSave(savedEnquiry);
                onClose();
            }, 1500);

        } catch (error) {
            console.error('❌ Error during handleSubmit:', error);
            setSubmitStatus({
                type: 'error',
                message: error.message || 'Failed to save enquiry. Please try again.'
            });
        } finally {

            setIsSubmitting(false);
        }
    }, [form, validateForm, initialData, onSave, onClose]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Escape") {
            onClose();
        } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    }, [onClose, handleSubmit]);

    const selectedVendorDetails = useMemo(() => {
        return form.assignedVendors
            .map((entry) => {
                const vendorId = typeof entry === 'string' ? entry : (entry?._id || entry?.__id || entry?.id);
                return vendors.find((v) => v.id === vendorId);
            })
            .filter(Boolean);
    }, [form.assignedVendors, vendors]);

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
            onClick={onClose}
            onKeyDown={handleKeyDown}
        >
            <div
                className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {initialData ? "Edit Enquiry" : "Create New Enquiry"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                        disabled={isSubmitting}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Status Message */}
                {submitStatus && (
                    <div className={`mb-4 p-4 rounded-lg flex items-start gap-3 ${submitStatus.type === 'success'
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                        }`}>
                        {submitStatus.type === 'success' ? (
                            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                        <p className={`text-sm font-medium ${submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                            }`}>
                            {submitStatus.message}
                        </p>
                    </div>
                )}

                <div className="space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Enquiry Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g., Office Plumbing Repair"
                            className={`w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            autoFocus
                            disabled={isSubmitting}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                        )}
                    </div>

                    {/* Category and City Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                className={`w-full border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                City
                            </label>
                            <select
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            >
                                <option value="">All Cities</option>
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Provide detailed information about your enquiry..."
                            className={`w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            rows={4}
                            disabled={isSubmitting}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Deadline <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="deadline"
                            value={form.deadline}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className={`w-full border ${errors.deadline ? 'border-red-300' : 'border-gray-300'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                            disabled={isSubmitting}
                        />
                        {errors.deadline && (
                            <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
                        )}
                    </div>

                    {/* Vendors Section */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Assign Vendors
                            {form.assignedVendors.length > 0 && (
                                <span className="ml-2 text-blue-600 text-xs font-normal">
                                    ({form.assignedVendors.length} selected • Will receive Telegram notification)
                                </span>
                            )}
                        </label>

                        <div className="relative mb-3">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={vendorSearch}
                                onChange={(e) => setVendorSearch(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <div className="border border-gray-200 rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
                            {filteredVendors.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                    <p className="font-medium">No vendors found</p>
                                    <p className="text-sm">Try adjusting your filters or search</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {filteredVendors.map((vendor) => {
                                        const score = getVendorScore(vendor);
                                        const isSelected = form.assignedVendors.includes(vendor.id);

                                        return (
                                            <div
                                                key={vendor.id}
                                                className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                    ? "bg-blue-50 border-blue-300 shadow-sm"
                                                    : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => !isSubmitting && toggleVendorSelection(vendor.id)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => { }}
                                                    className="h-4 w-4 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    disabled={isSubmitting}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                                <div className="ml-3 flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div>
                                                            <span className="font-semibold text-gray-900">{vendor.name}</span>
                                                            {vendor.telegramChatId && (
                                                                <span className="ml-2 inline-flex items-center text-xs text-blue-600">
                                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161l-1.84 8.673c-.139.645-.502.807-1.017.502l-2.813-2.075-1.358 1.308c-.151.151-.276.276-.567.276l.203-2.884 5.24-4.734c.228-.203-.05-.315-.353-.112l-6.473 4.077-2.789-.87c-.607-.19-.619-.607.127-.899l10.903-4.202c.506-.19.948.112.782.899z" />
                                                                    </svg>
                                                                    Telegram
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {score > 0 && (
                                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                                                                    ⭐ {score}
                                                                </span>
                                                            )}
                                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                                {vendor.city}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {vendor.email && (
                                                        <p className="text-sm text-gray-600 mt-1 truncate">{vendor.email}</p>
                                                    )}
                                                    {vendor.phone && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{vendor.phone}</p>
                                                    )}
                                                    {vendor.category && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {vendor.category.join(" • ")}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Selected Vendors Pills */}
                        {selectedVendorDetails.length > 0 && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                                    Selected Vendors ({selectedVendorDetails.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedVendorDetails.map((vendor) => (
                                        <span
                                            key={vendor.id}
                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium shadow-sm"
                                        >
                                            {vendor.name}
                                            <button
                                                type="button"
                                                onClick={() => toggleVendorSelection(vendor.id)}
                                                className="ml-2 hover:bg-blue-700 rounded-full p-0.5 transition-colors"
                                                aria-label={`Remove ${vendor.name}`}
                                                disabled={isSubmitting}
                                            >
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end items-center mt-6 pt-6 border-t border-gray-200 gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                {initialData ? "Update Enquiry" : "Create Enquiry"}
                            </>
                        )}
                    </button>
                </div>

                {/* Keyboard shortcuts hint */}
                {!isSubmitting && (
                    <div className="mt-3 text-xs text-gray-400 text-center">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600">Esc</kbd> to cancel •
                        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-600 ml-1">Ctrl+Enter</kbd> to save
                    </div>
                )}
            </div>
        </div>
    );
}