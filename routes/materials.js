import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Material Schema
const materialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    category: String,
    unit: String,
    specifications: Object,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Get materials from construction_db
router.get('/', async (req, res) => {
    try {
        // Connect to construction_db database
        const constructionDb = mongoose.connection.useDb('construction_db');
        const Material = constructionDb.model('Material', materialSchema);

        const materials = await Material.find({});
        res.json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});

// Create new material
router.post('/', async (req, res) => {
    try {
        const constructionDb = mongoose.connection.useDb('construction_db');
        const Material = constructionDb.model('Material', materialSchema);

        const material = new Material(req.body);
        await material.save();
        res.status(201).json(material);
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ error: 'Failed to create material' });
    }
});

export default router;
