const mongoose = require("mongoose");

const UnitSchema = new mongoose.Schema({
    name: String,
    type: {
        type: String,
        enum: ["ambulance", "fire", "police"],
    },
    status: {
        type: String,
        enum: ["available", "busy", "dispatched"],
        default: "available",
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
});

UnitSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Unit", UnitSchema);
