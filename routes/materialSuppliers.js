import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Material-Supplier relationship Schema
const materialSupplierSchema = new mongoose.Schema({
    materialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', required: true },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    unit: String,
    availability: { type: String, enum: ['Available', 'Limited', 'Out of Stock'], default: 'Available' },
    leadTime: Number, // in days
    minimumOrder: Number,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Get material-suppliers from construction_db with pagination
router.get('/', async (req, res) => {
    try {
        // Connect to construction_db database
        const constructionDb = mongoose.connection.useDb('construction_db');
        const MaterialSupplier = constructionDb.model('MaterialSupplier', materialSupplierSchema);

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const category = req.query.category || '';

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { 'materialId.name': { $regex: search, $options: 'i' } },
                { 'supplierId.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count
        const totalItems = await MaterialSupplier.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        // Get paginated data
        const materialSuppliers = await MaterialSupplier.find(query)
            .populate('materialId', 'name description category unit')
            .populate('supplierId', 'name country contact')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.json({
            data: materialSuppliers,
            page: page,
            pages: totalPages,
            total: totalItems,
            limit: limit
        });
    } catch (error) {
        console.error('Error fetching material-suppliers:', error);
        res.status(500).json({ error: 'Failed to fetch material-suppliers' });
    }
});

// Get material-suppliers with materials and suppliers data (for frontend)
router.get('/paginated', async (req, res) => {
    try {
        // Connect to construction_db database
        const constructionDb = mongoose.connection.useDb('construction_db');
        const MaterialSupplier = constructionDb.model('MaterialSupplier', materialSupplierSchema);
        const Material = constructionDb.model('Material', new mongoose.Schema({
            name: String,
            description: String,
            category: String,
            unit: String
        }));
        const Supplier = constructionDb.model('Supplier', new mongoose.Schema({
            name: String,
            country: String,
            contact: Object
        }));

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const category = req.query.category || '';

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { 'materialId.name': { $regex: search, $options: 'i' } },
                { 'supplierId.name': { $regex: search, $options: 'i' } }
            ];
        }

        // Get total count
        const totalItems = await MaterialSupplier.countDocuments(query);
        const totalPages = Math.ceil(totalItems / limit);

        // Get paginated data
        const materialSuppliers = await MaterialSupplier.find(query)
            .populate('materialId', 'name description category unit')
            .populate('supplierId', 'name country contact')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        // Get all materials and suppliers for the frontend
        const materials = await Material.find({});
        const suppliers = await Supplier.find({});

        res.json({
            data: materialSuppliers,
            materials: materials,
            suppliers: suppliers,
            page: page,
            pages: totalPages,
            total: totalItems,
            limit: limit
        });
    } catch (error) {
        console.error('Error fetching paginated material-suppliers:', error);
        res.status(500).json({ error: 'Failed to fetch paginated material-suppliers' });
    }
});

// Create new material-supplier relationship
router.post('/', async (req, res) => {
    try {
        const constructionDb = mongoose.connection.useDb('construction_db');
        const MaterialSupplier = constructionDb.model('MaterialSupplier', materialSupplierSchema);

        const materialSupplier = new MaterialSupplier(req.body);
        await materialSupplier.save();
        res.status(201).json(materialSupplier);
    } catch (error) {
        console.error('Error creating material-supplier:', error);
        res.status(500).json({ error: 'Failed to create material-supplier relationship' });
    }
});

export default router;
