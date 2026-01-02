const express = require("express");
const router = express.Router();
const {
    getUnits,
    createUnit,
} = require("../controllers/unitController");

router.get("/", getUnits);
router.post("/", createUnit);

module.exports = router;
