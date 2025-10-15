import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Supplier Schema
const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    contact: {
        email: String,
        phone: String,
        address: String
    },
    certifications: [String],
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Get suppliers from construction_db
router.get('/', async (req, res) => {
    try {
        // Connect to construction_db database
        const constructionDb = mongoose.connection.useDb('construction_db');
        const Supplier = constructionDb.model('Supplier', supplierSchema);

        const suppliers = await Supplier.find({});
        res.json(suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ error: 'Failed to fetch suppliers' });
    }
});

// Create new supplier
router.post('/', async (req, res) => {
    try {
        const constructionDb = mongoose.connection.useDb('construction_db');
        const Supplier = constructionDb.model('Supplier', supplierSchema);

        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        console.error('Error creating supplier:', error);
        res.status(500).json({ error: 'Failed to create supplier' });
    }
});

// Get one supplier by id
router.get('/:id', async (req, res) => {
    try {
        const constructionDb = mongoose.connection.useDb('construction_db');
        const Supplier = constructionDb.model('Supplier', supplierSchema);

        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
        res.json(supplier);
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).json({ error: 'Failed to fetch supplier' });
    }
});

// Update supplier by id (e.g., approve/reject)
router.put('/:id', async (req, res) => {
    try {
        const constructionDb = mongoose.connection.useDb('construction_db');
        const Supplier = constructionDb.model('Supplier', supplierSchema);

        const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Supplier not found' });
        res.json(updated);
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({ error: 'Failed to update supplier' });
    }
});

// Delete supplier by id
router.delete('/:id', async (req, res) => {
    try {
        const constructionDb = mongoose.connection.useDb('construction_db');
        const Supplier = constructionDb.model('Supplier', supplierSchema);

        const deleted = await Supplier.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Supplier not found' });
        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ error: 'Failed to delete supplier' });
    }
});

export default router;
