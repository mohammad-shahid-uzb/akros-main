import React from 'react';

const ItemDetailsModal = ({ show, onClose, item }) => {
    if (!show || !item) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold mb-4">Item Details</h3>
                <div className="space-y-2">
                    <p><strong>Item No:</strong> {item.itemNo}</p>
                    <p><strong>Description:</strong> {item.description}</p>
                    <p><strong>Rate:</strong> {item.rate}</p>
                    <p><strong>Rate in Words:</strong> {item.rateInWords}</p>
                    <p><strong>Per:</strong> {item.per}</p>
                    <p><strong>Unit:</strong> {item.unit}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>City:</strong> {item.city}</p>
                    <p><strong>Vendor Name:</strong> {item.vendorName}</p>
                    <p><strong>Vendor Phone:</strong> {item.vendorPhone}</p>
                    <p><strong>Vendor Address:</strong> {item.vendorAddress}</p>
                </div>
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsModal;
