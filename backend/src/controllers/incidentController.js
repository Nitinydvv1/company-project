const Incident = require("../models/Incident");
const { isDBConnected } = require("../config/db");
const incidentsData = require("../data/incidents");
const { classifyIncidentSeverity } = require("../services/aiClassifier");

// In-memory storage fallback
let inMemoryIncidents = [...incidentsData];
let nextId = inMemoryIncidents.length + 1;

exports.getIncidents = async (req, res) => {
    try {
        if (isDBConnected()) {
            const incidents = await Incident.find();
            // Transform MongoDB documents to match frontend expected format
            const transformed = incidents.map(incident => ({
                id: incident._id,
                title: incident.title,
                description: incident.description,
                severity: incident.severity,
                status: incident.status,
                lat: incident.location?.coordinates?.[1] || 0,
                lng: incident.location?.coordinates?.[0] || 0,
                createdAt: incident.createdAt,
            }));
            res.json(transformed);
        } else {
            // Return in-memory data
            res.json(inMemoryIncidents);
        }
    } catch (error) {
        console.error("Error fetching incidents:", error.message);
        res.json(inMemoryIncidents);
    }
};

exports.createIncident = async (req, res) => {
    try {
        const { title, description, lat, lng, severity: providedSeverity } = req.body;

        // Use AI to classify severity if not provided
        let severity = providedSeverity;
        if (!severity) {
            console.log("🤖 Using AI to classify incident severity...");
            severity = await classifyIncidentSeverity(title, description || "");
            console.log(`📊 Severity classified as: ${severity}`);
        }

        if (isDBConnected()) {
            console.log("💾 Saving to MongoDB...");
            const incident = await Incident.create({
                title,
                description,
                severity,
                location: {
                    type: "Point",
                    coordinates: [lng, lat],
                },
            });
            // Transform MongoDB document to match frontend expected format
            const response = {
                id: incident._id,
                title: incident.title,
                description: incident.description,
                severity: incident.severity,
                status: incident.status,
                lat: incident.location.coordinates[1],
                lng: incident.location.coordinates[0],
                createdAt: incident.createdAt,
            };
            console.log("✅ Incident saved:", response);
            res.status(201).json(response);
        } else {
            console.log("⚠️ Using in-memory storage (no DB connection)");
            // Use in-memory storage
            const newIncident = {
                id: nextId++,
                title,
                description,
                lat,
                lng,
                severity,
                status: "open",
                createdAt: new Date().toISOString(),
            };
            inMemoryIncidents.push(newIncident);
            console.log("✅ Incident saved to memory:", newIncident);
            res.status(201).json(newIncident);
        }
    } catch (error) {
        console.error("Error creating incident:", error.message);
        res.status(500).json({ error: "Failed to create incident" });
    }
};
