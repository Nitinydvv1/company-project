const Unit = require("../models/Unit");
const { isDBConnected } = require("../config/db");
const unitsData = require("../data/units");

// In-memory storage fallback
let inMemoryUnits = [...unitsData];
let nextId = 4;

// Seed units if database is empty
const seedUnits = async () => {
    try {
        const count = await Unit.countDocuments();
        if (count === 0) {
            console.log("📦 Seeding units to database...");
            for (const unit of unitsData) {
                await Unit.create({
                    name: unit.name,
                    type: unit.type,
                    status: unit.status,
                    location: {
                        type: "Point",
                        coordinates: [unit.lng, unit.lat],
                    },
                });
            }
            console.log(`✅ Seeded ${unitsData.length} units to database`);
        }
    } catch (error) {
        console.error("Error seeding units:", error.message);
    }
};

exports.getUnits = async (req, res) => {
    try {
        if (isDBConnected()) {
            // Seed units if empty
            await seedUnits();
            
            const units = await Unit.find();
            // Transform MongoDB documents to match frontend expected format
            const transformed = units.map(unit => ({
                id: unit._id,
                name: unit.name,
                type: unit.type,
                status: unit.status || "available",
                lat: unit.location?.coordinates?.[1] || 0,
                lng: unit.location?.coordinates?.[0] || 0,
            }));
            res.json(transformed);
        } else {
            // Return in-memory data
            res.json(inMemoryUnits);
        }
    } catch (error) {
        console.error("Error fetching units:", error.message);
        res.json(inMemoryUnits);
    }
};

exports.createUnit = async (req, res) => {
    try {
        const { name, type, lat, lng } = req.body;

        if (isDBConnected()) {
            const unit = await Unit.create({
                name,
                type,
                location: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
            });
            res.status(201).json(unit);
        } else {
            // Use in-memory storage
            const newUnit = {
                id: `UNIT0${nextId++}`,
                name,
                type,
                status: "available",
                lat,
                lng,
            };
            inMemoryUnits.push(newUnit);
            res.status(201).json(newUnit);
        }
    } catch (error) {
        console.error("Error creating unit:", error.message);
        res.status(500).json({ error: "Failed to create unit" });
    }
};
