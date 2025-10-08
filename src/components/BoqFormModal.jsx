import React, { useEffect, useRef, useState } from "react";

export default function BoqFormModal({
    show,
    onClose,
    onSave,
    initialData,
    rateList = [] // Receive rateList prop
}) {
    const [itemSearch, setItemSearch] = useState("");
    const [isItemOpen, setIsItemOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const [subSearch, setSubSearch] = useState("");
    const [isSubOpen, setIsSubOpen] = useState(false);
    const [selectedSub, setSelectedSub] = useState(null);

    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState(""); // ✅ NEW state for Unit

    const contentRef = useRef(null);
    const disableItemSelect = !!initialData._id; // lock itemNo in edit-mode if initialData has an _id

    useEffect(() => {
        if (!show) return;

        if (initialData && initialData._id) {
            // Editing existing item
            // find master item if exists
            const master = rateList.find((b) => b.itemNo === initialData.itemNo);
            setSelectedItem(
                master || {
                    itemNo: initialData.itemNo,
                    description: initialData.description || "",
                    rate: initialData.rate ?? 0,
                    subItems: initialData.subItems || []
                }
            );

            // find subItem if provided
            const masterSub = (master?.subItems || []).find(
                (s) => s.subItemNo === initialData.subItemNo
            );

            if (masterSub) {
                setSelectedSub(masterSub);
                setSubSearch(masterSub.subItemNo);
            } else if (initialData.subItemNo) {
                // fallback to initialData's subItemNo
                setSelectedSub({
                    subItemNo: initialData.subItemNo,
                    subDescription: initialData.subDescription || "",
                    rate: initialData.rate ?? (master?.rate ?? 0)
                });
                setSubSearch(initialData.subItemNo);
            } else {
                setSelectedSub(null);
                setSubSearch("");
            }

            setItemSearch(initialData.itemNo || "");
            setQuantity(String(initialData.quantity ?? ""));
            setUnit(initialData.unit || ""); // ✅ pre-fill unit in edit-mode
        } else {
            // Adding new item - show rate selection
            setSelectedItem(null);
            setSelectedSub(null);
            setItemSearch("");
            setSubSearch("");
            setQuantity("");
            setUnit("");
            setIsItemOpen(true); // Automatically open item selection for new entries
        }

        setIsSubOpen(false);
    }, [show, initialData, rateList]);

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (show) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [show, onClose]);

    if (!show) return null;

    // filtered item list - now from rateList
    const filteredItems = rateList.filter(
        (i) =>
            i.itemNo.includes(itemSearch) ||
            i.description.toLowerCase().includes(itemSearch.toLowerCase())
    );

    // filtered subitems (based on selectedItem)
    const subItemsForSelected = (selectedItem?.subItems && selectedItem.subItems.length)
        ? selectedItem.subItems
        : [
            {
                subItemNo: selectedItem ? `${selectedItem.itemNo}-1` : "",
                subDescription: selectedItem ? `${selectedItem.description}-M20` : "",
                rate: selectedItem ? selectedItem.rate : 0
            }
        ];

    const filteredSubs = subItemsForSelected.filter(
        (s) =>
            s.subItemNo.includes(subSearch) ||
            s.subDescription.toLowerCase().includes(subSearch.toLowerCase())
    );

    const chooseItem = (item) => {
        if (disableItemSelect) return;
        setSelectedItem(item);
        setItemSearch(item.itemNo);
        setIsItemOpen(false);

        // reset sub selection when item changes
        setSelectedSub(null);
        setSubSearch("");
        setIsSubOpen(true);
    };

    const chooseSub = (s) => {
        setSelectedSub(s);
        setSubSearch(s.subItemNo);
        setIsSubOpen(false);
    };

    // Get the description to show - uses subDescription if available
    const getDisplayDescription = () => {
        if (selectedSub?.subDescription) {
            return selectedSub.subDescription;
        }
        return selectedItem?.description || "";
    };

    const handleSave = () => {
        if (!selectedItem) return alert("Please select an Item No from the Rate List"); // Adjusted message
        if (!selectedSub) return alert("Please select a Sub Item from the Rate List"); // Adjusted message
        const qty = Number(quantity);
        if (!qty || qty <= 0) return alert("Please enter a valid quantity");
        if (!unit) return alert("Please select a Unit"); // ✅ unit required

        const rateToUse = Number(selectedSub.rate ?? selectedItem.rate ?? 0);
        const saved = {
            itemNo: selectedItem.itemNo,
            description: selectedItem.description,
            subItemNo: selectedSub.subItemNo,
            subDescription: selectedSub.subDescription,
            rate: rateToUse,
            quantity: qty,
            unit, // ✅ save unit
            amount: qty * rateToUse
        };

        onSave(saved);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
            onClick={onClose}
        >
            <div
                ref={contentRef}
                className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl overflow-x-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-semibold mb-8 text-gray-800 text-center">
                    {disableItemSelect ? "Edit Item" : "Add Item"}
                </h3>

                {/* PROFESSIONAL HORIZONTAL GRID FORM */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-w-[900px] items-end">
                    {/* Item No */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item No</label>
                        {disableItemSelect ? (
                            <input
                                type="text"
                                value={selectedItem?.itemNo ?? ""}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search itemNo or description..."
                                    value={itemSearch}
                                    onChange={(e) => {
                                        setItemSearch(e.target.value);
                                        setSelectedItem(null);
                                        setIsItemOpen(true);
                                    }}
                                    onFocus={() => setIsItemOpen(true)}
                                    className="w-full p-2 border rounded"
                                />
                                {isItemOpen && (
                                    <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-auto border rounded bg-white z-40 shadow-md">
                                        {filteredItems.length === 0 ? (
                                            <div className="p-2 text-sm text-gray-500">No items</div>
                                        ) : (
                                            filteredItems.map((it) => (
                                                <div
                                                    key={it.itemNo}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        chooseItem(it);
                                                    }}
                                                    className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedItem?.itemNo === it.itemNo ? "bg-gray-100" : ""}`}
                                                >
                                                    <div className="font-medium">{it.itemNo} — {it.description}</div>
                                                    <div className="text-xs text-gray-600">Rate: {it.rate}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sub Item */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Item</label>
                        {!selectedItem ? (
                            <input
                                type="text"
                                readOnly
                                value=""
                                placeholder="Select Item No first"
                                className="w-full p-2 border rounded bg-gray-50"
                            />
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search sub item..."
                                    value={subSearch}
                                    onChange={(e) => {
                                        setSubSearch(e.target.value);
                                        setIsSubOpen(true);
                                    }}
                                    onFocus={() => setIsSubOpen(true)}
                                    className="w-full p-2 border rounded"
                                />
                                {isSubOpen && (
                                    <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-auto border rounded bg-white z-40 shadow-md">
                                        {filteredSubs.length === 0 ? (
                                            <div className="p-2 text-sm text-gray-500">No sub items</div>
                                        ) : (
                                            filteredSubs.map((s) => (
                                                <div
                                                    key={s.subItemNo}
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        chooseSub(s);
                                                    }}
                                                    className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedSub?.subItemNo === s.subItemNo ? "bg-gray-100" : ""}`}
                                                >
                                                    <div className="font-medium">{s.subItemNo} — {s.subDescription}</div>
                                                    <div className="text-xs text-gray-600">Rate: {s.rate}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description (span 2 columns) */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            value={getDisplayDescription()}
                            readOnly
                            className="w-full p-2 border rounded bg-gray-100"
                        />
                    </div>

                    {/* Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                        <input
                            type="number"
                            value={(selectedSub?.rate ?? selectedItem?.rate) ?? ""}
                            readOnly
                            className="w-full p-2 border rounded bg-gray-100"
                        />
                    </div>
                    {/* Unit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">-- Select Unit --</option>
                            <option value="m">Meter (m)</option>
                            <option value="m2">Square Meter (m²)</option>
                            <option value="m3">Cubic Meter (m³)</option>
                            <option value="kg">Kilogram (kg)</option>
                            <option value="ton">Ton (t)</option>
                            <option value="pcs">Pieces (pcs)</option>
                            <option value="ltr">Liter (L)</option>
                            <option value="hr">Hour (hr)</option>
                            <option value="day">Day</option>
                            <option value="set">Set</option>
                            <option value="roll">Roll</option>
                            <option value="bag">Bag</option>
                            <option value="box">Box</option>
                        </select>
                    </div>
                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                            type="text"
                            readOnly
                            value={
                                quantity && (selectedSub || selectedItem)
                                    ? (Number(quantity) * Number(selectedSub?.rate ?? selectedItem?.rate)).toFixed(2)
                                    : ""
                            }
                            className="w-full p-2 border rounded bg-gray-100"
                        />
                    </div>
                </div>

                {/* BUTTONS */}
                <div className="flex justify-end space-x-3 mt-10">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedItem || !selectedSub || !quantity || Number(quantity) <= 0 || !unit}
                        className={`px-6 py-2 rounded-lg text-white transition ${(!selectedItem || !selectedSub || !quantity || Number(quantity) <= 0 || !unit)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
