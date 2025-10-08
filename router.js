import express from "express";
import Rate from "../models/Rate.js";
import redis from "redis";

const router = express.Router();

const client = redis.createClient();
client.on('error', (err) => console.log('Redis Client Error', err));

// Connect Redis client (wrapped in an async IIFE for top-level await)
(async () => {
    await client.connect();
    console.log('Connected to Redis');
})();

// recursive population helper
async function populateChildren(doc, depth = 5) {
    if (!doc || depth === 0) return doc;
    await doc.populate("children");
    if (doc.children?.length) {
        for (let i = 0; i < doc.children.length; i++) {
            doc.children[i] = await populateChildren(doc.children[i], depth - 1);
        }
    }
    return doc;
}

// 📥 Import CSV data
import fs from "fs";
import csvParser from "csv-parser";

// 📥 Import DSR2002 CSV data via seed route
import importDSR2002Data from "../importDSR2002.js";

router.post("/import", async (req, res) => {
    try {
        const results = [];
        fs.createReadStream("DSR2002.csv")
            .pipe(csvParser())
            .on("data", (row) => {
                results.push(row);
            })
            .on("end", async () => {
                const docs = results.map(r => ({
                    itemNo: r.itemNo || null,
                    description: r.description,
                    rate: r.rate || null,
                    rateinwords: r.rateinwords,
                    per: r.per || null,
                    unit: r.unit,
                    category: r.category,
                    city: r.city,
                    vendorName: r.vendorName,
                    vendorPhone: r.vendorPhone,
                    vendorAddress: r.vendorAddress,
                    isHeading: !r.itemNo // if no itemNo, treat as heading
                }));

                await Rate.insertMany(docs);
                res.json({ message: "CSV imported successfully", count: docs.length });
            });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📥 Import DSR2002 CSV data via seed route
router.post("/seed", async (req, res) => {
    try {
        // Access the uri from req.app.locals
        const uri = req.app.locals.mongodbUri;
        if (!uri) {
            throw new Error("MongoDB URI not available in app locals.");
        }
        await importDSR2002Data(uri);
        res.status(200).json({ message: "DSR2002 data seeding initiated successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ➕ Create rate
router.post("/", async (req, res) => {
    try {
        const rate = new Rate(req.body);
        await rate.save();
        res.status(201).json(rate);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ✅ GET rates with pagination, filtering, and Redis caching
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Now expecting 1-based page from frontend
        const size = parseInt(req.query.size) || 10; // Frontend sends 'size' for limit
        const searchTerm = req.query.search || ''; // Frontend sends 'search'

        const cacheKey = `rates:search:${searchTerm}:page:${page}:size:${size}`;

        // Check Redis cache
        const cached = await client.get(cacheKey);
        if (cached) {
            console.log('Serving from Redis cache');
            return res.json(JSON.parse(cached));
        }

        const query = {};
        if (searchTerm) {
            query.$or = [
                { itemNo: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
            ];
        }

        const totalItems = await Rate.countDocuments(query);
        const totalPages = Math.ceil(totalItems / size);

        const rates = await Rate.find(query)
            .skip((page - 1) * size) // Adjust skip for 1-based page
            .limit(size)
            .lean(); // .lean() for faster fetching if you don't need Mongoose documents

        const response = {
            currentPage: page, // Already 1-based
            totalPages: totalPages,
            totalItems: totalItems,
            rates: rates,
        };

        // Cache this page with an expiration (e.g., 60 seconds)
        await client.setEx(cacheKey, 60, JSON.stringify(response));
        console.log('Serving from MongoDB and caching in Redis');

        res.json(response);
    } catch (err) {
        console.error("Error in /api/rate route:", err);
        res.status(500).json({ error: err.message });
    }
});

// 📜 Get one by ID (with children)
router.get("/:id", async (req, res) => {
    try {
        const rate = await Rate.findById(req.params.id);
        if (!rate) return res.status(404).json({ error: "Not found" });
        const populated = await populateChildren(rate);
        res.json(populated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✏️ Update
router.put("/:id", async (req, res) => {
    try {
        // Invalidate cache for relevant search/pagination keys if needed
        // For simplicity, we'll just proceed with update. More robust caching might involve specific cache invalidation.
        const updated = await Rate.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: "Not found" });
        // Consider clearing relevant caches after an update
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ❌ Delete
router.delete("/:id", async (req, res) => {
    try {
        // Invalidate cache for relevant search/pagination keys if needed
        const deleted = await Rate.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Not found" });
        // Consider clearing relevant caches after a deletion
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
