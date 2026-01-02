const mongoose = require("mongoose");

const IncidentSchema = new mongoose.Schema(
    {
        title: String,
        description: String,
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
        },
        status: {
            type: String,
            default: "open",
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                required: true,
            },
            coordinates: {
                type: [Number], // [lng, lat]
                required: true,
            },
        },
    },
    { timestamps: true }
);

IncidentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Incident", IncidentSchema);
