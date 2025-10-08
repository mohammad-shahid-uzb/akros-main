import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Supplier Schema
const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    country: String,
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

export default router;
