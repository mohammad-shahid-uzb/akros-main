import React, { useState, useRef, useEffect } from "react";

export default function ItemNoInput({ form, setForm, onValidationChange }) {
    const [isCheckingItemNo, setIsCheckingItemNo] = useState(false);
    const [itemNoUniqueCheckMsg, setItemNoUniqueCheckMsg] = useState("");
    const [isItemNoUnique, setIsItemNoUnique] = useState(true);
    const [itemNoAvailable, setItemNoAvailable] = useState(false);

    // Auto-format input while typing - allow letters, numbers, dots, and hyphens
    const formatItemNo = (value) => {
        // Remove any characters that aren't letters, numbers, dots, or hyphens
        let formatted = value.replace(/[^\w.-]/g, "");

        // Limit to maximum 10 characters
        if (formatted.length > 10) {
            formatted = formatted.slice(0, 10);
        }

        return formatted;
    };

    // Debounce utility
    function debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    }

    // Use ref to persist debounce function
    const debouncedCheckItemNoRef = useRef();

    useEffect(() => {
        debouncedCheckItemNoRef.current = debounce((value) => {
            if (onValidationChange) {
                onValidationChange(
                    value,
                    setIsCheckingItemNo,
                    setItemNoUniqueCheckMsg,
                    setIsItemNoUnique,
                    setItemNoAvailable
                );
            }
        }, 500);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onValidationChange]);

    const handleChange = (e) => {
        const formatted = formatItemNo(e.target.value);
        setForm((prev) => ({ ...prev, itemNo: formatted }));
        setItemNoAvailable(false); // reset green check on edit

        // Trigger validation
        if (debouncedCheckItemNoRef.current) {
            debouncedCheckItemNoRef.current(formatted);
        }
    };

    const handleBlur = () => {
        if (debouncedCheckItemNoRef.current) {
            debouncedCheckItemNoRef.current(form.itemNo);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-sm">
            <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="itemNo"
            >
                Item No
            </label>
            <div className="relative w-full">
                <input
                    type="text"
                    id="itemNo"
                    name="itemNo"
                    value={form.itemNo}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${itemNoUniqueCheckMsg
                        ? "border-red-500 bg-red-50"
                        : itemNoAvailable
                            ? "border-green-500 bg-green-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                    placeholder="Enter Item No (e.g. 22.22.22.1)"
                    aria-invalid={!isItemNoUnique}
                    aria-describedby="itemNoHelp"
                    maxLength={10}
                    autoComplete="off"
                />

                {/* Success Icon */}
                {itemNoAvailable && !isCheckingItemNo && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-lg">✅</span>
                )}

                {/* Loading Icon */}
                {isCheckingItemNo && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⏳</span>
                )}
            </div>

            {/* Status Messages */}
            <div aria-live="polite" className="min-h-[1.5rem] mt-1">
                {isCheckingItemNo && (
                    <span className="block text-xs text-gray-500">Checking uniqueness...</span>
                )}

                {itemNoUniqueCheckMsg && (
                    <span id="itemNoHelp" className="block text-xs text-red-500" role="alert">
                        {itemNoUniqueCheckMsg}
                    </span>
                )}

                {itemNoAvailable && !itemNoUniqueCheckMsg && (
                    <span className="block text-xs text-green-600">
                        Item No is available ✔
                    </span>
                )}

                {!itemNoUniqueCheckMsg && !itemNoAvailable && !isCheckingItemNo && (
                    <span className="block text-xs text-gray-500">Example: 22.22.22.1 (max 10 chars)</span>
                )}
            </div>
        </div>
    );
}
