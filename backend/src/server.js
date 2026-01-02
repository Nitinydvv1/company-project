// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const incidentRoutes = require("./routes/incidentRoutes");

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use("/api/incidents", incidentRoutes);

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`✅ Backend running on http://localhost:${PORT}`);
// });


const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/incidents", require("./routes/incidentRoutes"));
app.use("/api/units", require("./routes/unitRoutes"));

app.get("/", (req, res) => {
    res.send("Emergency Dispatch API Running");
});

const PORT = process.env.PORT || 5000;

// Start server after DB connection
const startServer = async () => {
    await connectDB();
    
    // Clear incidents on startup (incidents are session-based, not permanent)
    try {
        const mongoose = require("mongoose");
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.collection("incidents").deleteMany({});
            console.log("🗑️  Incidents cleared - starting fresh session");
        }
    } catch (err) {
        // Collection might not exist yet, that's fine
    }
    
    app.listen(PORT, () =>
        console.log(`✅ Backend running on http://localhost:${PORT}`)
    );
};

startServer();

