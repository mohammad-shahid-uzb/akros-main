import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import ItemNoInput from "./ItemNoInput";


// Converts number to words (placeholder)
const numberToWords = (num) => (num ? `Rupees ${num} only` : "");

const defaultForm = {
    itemNo: "",
    description: "",
    rate: "",
    rateInWords: "",
    per: "1",
    unit: "sqm",
    category: "Misc",
    city: "",
    vendorName: "",
    vendorPhone: "",
    vendorAddress: "",
};

const itemNoPattern = /^[\w.-]{1,10}$/;

const RateInputModal = ({ show, onClose, onSave, initialData }) => {
    const [form, setForm] = useState(defaultForm);
    const [isItemNoUnique, setIsItemNoUnique] = useState(true);
    const [isCheckingItemNo, setIsCheckingItemNo] = useState(false);

    // Populate form on open or when initialData changes
    useEffect(() => {
        //console.log('API_BASE_URL:', API_BASE_URL);
        setForm(initialData ? { ...defaultForm, ...initialData } : defaultForm);
        setIsItemNoUnique(true);
    }, [initialData, show]);

    // Update rateInWords when rate changes
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            rateInWords: numberToWords(prev.rate),
        }));
    }, [form.rate]);

    // Validation callback for ItemNoInput
    const handleItemNoValidation = async (itemNoToCheck, setIsChecking, setErrorMsg, setIsUnique, setAvailable) => {
        if (!itemNoToCheck) {
            setIsUnique(true);
            setErrorMsg("");
            setAvailable(false);
            return;
        }

        if (initialData && initialData.itemNo === itemNoToCheck) {
            setIsUnique(true);
            setErrorMsg("");
            setAvailable(true);
            return;
        }

        // Basic format validation - allow up to 10 characters with letters, numbers, dots, hyphens
        console.log('Validating itemNo:', itemNoToCheck, 'Length:', itemNoToCheck.length, 'Pattern test:', itemNoPattern.test(itemNoToCheck));
        if (!itemNoPattern.test(itemNoToCheck)) {
            setIsUnique(false);
            setErrorMsg("Max 10 characters, only letters, numbers, dots, hyphens");
            setAvailable(false);
            return;
        }

        // Only check for trailing dots/hyphens if the field is not empty and has more than 1 character
        if (itemNoToCheck.length > 1 && (itemNoToCheck.endsWith('.') || itemNoToCheck.endsWith('-'))) {
            setIsUnique(false);
            setErrorMsg("Cannot end with dot or hyphen");
            setAvailable(false);
            return;
        }

        setIsChecking(true);
        setIsCheckingItemNo(true);
        try {
            console.log(`Checking uniqueness for URL: ${API_BASE_URL}/rates/check-itemno/${itemNoToCheck}`);
            const { data } = await axios.get(`${API_BASE_URL}/rates/check-itemno/${itemNoToCheck}`);
            console.log('Backend response:', data);

            if (data && data.isUnique === false) {
                setIsUnique(false);
                setErrorMsg(data.message || "Item Number already exists.");
                setAvailable(false);
            } else {
                setIsUnique(true);
                setErrorMsg("");
                setAvailable(true);
            }
        } catch (error) {
            console.error("Error checking item number:", error.response?.data || error.message);
            setIsUnique(false);
            const errorMessage = error.response?.data?.message || error.message || "Unable to verify uniqueness. Please try again.";
            setErrorMsg(errorMessage);
            setAvailable(false);
        } finally {
            setIsChecking(false);
            setIsCheckingItemNo(false);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        if (name === "vendorPhone") val = value.replace(/[^0-9]/g, "");
        setForm((prev) => ({ ...prev, [name]: val }));
    };

    // Save handler
    const handleSave = () => {
        const {
            itemNo,
            description,
            rate,
            unit,
            city,
            vendorName,
            vendorPhone,
        } = form;

        if (!itemNo || !description || !rate || !unit || !city || !vendorName) {
            alert(
                "Please fill all required fields: Item No, Description, Rate, Unit, City, Vendor Name"
            );
            return;
        }
        if (!itemNoPattern.test(itemNo)) {
            alert("Item No format is invalid. Max 10 characters, only letters, numbers, dots, hyphens.");
            return;
        }
        if (itemNo.length > 1 && (itemNo.endsWith('.') || itemNo.endsWith('-'))) {
            alert("Item No cannot end with dot or hyphen.");
            return;
        }
        if (vendorPhone && !/^[0-9]{10}$/.test(vendorPhone)) {
            alert("Vendor Phone must be a 10-digit number.");
            return;
        }
        if (!isItemNoUnique) {
            alert("Item Number is not unique. Please choose a different one.");
            return;
        }
        console.log('Saving form data:', form);
        onSave({
            ...(initialData && { _id: initialData._id }),
            ...form,
            rate: parseFloat(rate).toFixed(2),
        });
        onClose();
    };

    if (!show) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl max-h-screen overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-semibold mb-8 text-gray-800 text-center">
                    {initialData ? "Edit Rate Item" : "Add Rate Item"}
                </h3>
                {/* PROFESSIONAL HORIZONTAL GRID FORM */}
                <div className="w-full">
                    {/* Top row: Item No, Description, Rate */}
                    <div className="flex flex-col gap-6 w-full">
                        {/* Item No */}
                        <div className="w-full">
                            <ItemNoInput
                                form={form}
                                setForm={setForm}
                                onValidationChange={handleItemNoValidation}
                            />
                        </div>
                        {/* Description */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                                Description
                            </label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                                placeholder="Enter Description"
                            />
                        </div>
                        {/* Rate */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rate">
                                Rate
                            </label>
                            <input
                                type="number"
                                id="rate"
                                name="rate"
                                value={form.rate}
                                onChange={handleChange}
                                className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                                placeholder="Enter Rate"
                            />
                        </div>
                    </div>
                    {/* Rate in Words */}
                    <div className="md:col-span-2">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="rateInWords"
                        >
                            Rate in Words
                        </label>
                        <input
                            type="text"
                            id="rateInWords"
                            name="rateInWords"
                            value={form.rateInWords}
                            readOnly
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        />
                    </div>
                    {/* Per */}
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="per"
                        >
                            Per
                        </label>
                        <input
                            type="text"
                            id="per"
                            name="per"
                            value={form.per}
                            onChange={handleChange}
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                            placeholder="Enter Per"
                        />
                    </div>
                    {/* Unit */}
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="unit"
                        >
                            Unit
                        </label>
                        <select
                            id="unit"
                            name="unit"
                            value={form.unit}
                            onChange={handleChange}
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                        >
                            <option value="">Select Unit</option>
                            <option value="sqm">Square Meter (sqm)</option>
                            <option value="m">Meter (m)</option>
                            <option value="m3">Cubic Meter (m³)</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="pcs">Pieces (pcs)</option>
                            <option value="ltr">Liter (L)</option>
                            <option value="day">Day</option>
                            <option value="set">Set</option>
                        </select>
                    </div>
                    {/* Category */}
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="category"
                        >
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                        >
                            <option value="All">All</option>
                            <option value="ALUMINIUM WORK">ALUMINIUM WORK</option>
                            <option value="BRICK WORK">BRICK WORK</option>
                            <option value="CONCRETE WORK">CONCRETE WORK</option>
                            <option value="DEMOLISHEN">DEMOLISHEN</option>
                            <option value="DRAINAGE">DRAINAGE</option>
                            <option value="EARTHWORK">EARTHWORK</option>
                            <option value="FINISHING">FINISHING</option>
                            <option value="FLOORING">FLOORING</option>
                            <option value="HIRE CHARGES">HIRE CHARGES</option>
                            <option value="LABOUR">LABOUR</option>
                            <option value="LANDSCAPING">LANDSCAPING</option>
                            <option value="MARBLE WORK">MARBLE WORK</option>
                            <option value="MISCELLANEUS">MISCELLANEUS</option>
                            <option value="MORTARS">MORTARS</option>
                            <option value="Material">Material</option>
                            <option value="Misc">Misc</option>
                            <option value="PILE WORK">PILE WORK</option>
                            <option value="RCC">RCC</option>
                            <option value="REPAIRS">REPAIRS</option>
                            <option value="ROAD WORK">ROAD WORK</option>
                            <option value="ROOFING">ROOFING</option>
                            <option value="SANITARY">SANITARY</option>
                            <option value="STEEL WORK">STEEL WORK</option>
                            <option value="STONE WORK">STONE WORK</option>
                            <option value="WATER PROOFING">WATER PROOFING</option>
                            <option value="WOOD WORK">WOOD WORK</option>
                        </select>
                    </div>
                    {/* City */}
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="city"
                        >
                            City
                        </label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                            placeholder="Enter City"
                        />
                    </div>
                    {/* Vendor Name */}
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="vendorName"
                        >
                            Vendor Name
                        </label>
                        <input
                            type="text"
                            id="vendorName"
                            name="vendorName"
                            value={form.vendorName}
                            onChange={handleChange}
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                            placeholder="Enter Vendor Name"
                        />
                    </div>
                    {/* Vendor Phone */}
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="vendorPhone"
                        >
                            Vendor Phone
                        </label>
                        <input
                            type="tel"
                            id="vendorPhone"
                            name="vendorPhone"
                            value={form.vendorPhone}
                            onChange={handleChange}
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400"
                            placeholder="Enter Vendor Phone (10 digits)"
                            maxLength="10"
                        />
                    </div>
                    {/* Vendor Address */}
                    <div className="md:col-span-4">
                        <label
                            className="block text-sm font-medium text-gray-700 mb-1"
                            htmlFor="vendorAddress"
                        >
                            Vendor Address
                        </label>
                        <textarea
                            id="vendorAddress"
                            name="vendorAddress"
                            value={form.vendorAddress}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400 resize-none"
                            placeholder="Enter Vendor Address"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-10">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg text-white transition bg-green-600 hover:bg-green-700"
                        disabled={
                            !isItemNoUnique ||
                            isCheckingItemNo ||
                            !form.itemNo ||
                            !itemNoPattern.test(form.itemNo)
                        }
                    >
                        {isCheckingItemNo ? "Checking..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RateInputModal;