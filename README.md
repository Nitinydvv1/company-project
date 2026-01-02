# 🚨 Emergency Dispatch Dashboard

An AI-powered emergency response coordination system with real-time incident tracking, unit dispatch, and performance metrics.

## 📋 Features

- **Interactive Map View** - Real-time visualization of incidents and units using Leaflet.js
- **AI-Driven Severity Classification** - Automatic incident classification using OpenAI GPT
- **Unit Dispatch System** - Assign nearest available units to incidents
- **Response Time Tracking** - Monitor ETA and average response times
- **Performance Metrics** - Dashboard showing key operational metrics
- **REST API** - Full CRUD operations for incidents and units
- **MongoDB Storage** - Geospatial queries for location-based operations

## 🛠️ Tech Stack

- **Frontend**: React.js, Leaflet.js, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with 2dsphere indexes
- **AI**: OpenAI GPT API for incident classification
- **Deployment**: Docker, Docker Compose

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API Key (optional, for AI classification)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Request
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install

   # Create .env file
   echo "PORT=5001
   MONGODB_URI=mongodb://localhost:27017/emergencyDB
   OPENAI_API_KEY=your-api-key-here" > .env

   npm run dev
   ```

3. **Setup Frontend**

   ```bash
   cd emergency-dashboard
   npm install
   npm run dev
   ```

4. **Access the Dashboard**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001

### Docker Deployment

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=your-api-key-here

# Start all services
docker-compose up -d

# Access the dashboard
open http://localhost:3000
```

## 📁 Project Structure

```
Request/
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI classifier service
│   │   └── server.js       # Express server
│   ├── scripts/
│   │   └── generateIncidents.js  # Sample data generator
│   └── Dockerfile
├── emergency-dashboard/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main dashboard
│   │   └── App.css         # Styles
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## 🔌 API Endpoints

### Incidents

- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Create new incident (with AI classification)

### Units

- `GET /api/units` - Get all units
- `POST /api/units` - Create new unit

## 📊 Sample Data Generator

Generate test incidents:

```bash
cd backend

# Generate 5 incidents with predefined severity
node scripts/generateIncidents.js 5

# Generate 10 incidents with AI classification
node scripts/generateIncidents.js 10 --ai
```

## 🎯 Dispatch Workflow

1. **View Incidents** - See all active incidents on the map (color-coded by severity)
2. **Select Incident** - Click on an incident to view details
3. **Dispatch Unit** - Click "Dispatch Unit" to see available units sorted by distance
4. **Assign Unit** - Select a unit and confirm dispatch
5. **Track Response** - Monitor ETA and response metrics

## 🔧 Configuration

### Environment Variables

| Variable         | Description                          | Default                               |
| ---------------- | ------------------------------------ | ------------------------------------- |
| `PORT`           | Backend server port                  | 5001                                  |
| `MONGODB_URI`    | MongoDB connection string            | mongodb://localhost:27017/emergencyDB |
| `OPENAI_API_KEY` | OpenAI API key for AI classification | (optional)                            |

### Severity Classification

Without OpenAI API key, the system uses keyword-based classification:

- **High**: fire, explosion, shooting, heart attack, etc.
- **Medium**: accident, crash, injury, assault, theft, etc.
- **Low**: noise complaint, parking violation, lost pet, etc.

## 📸 Screenshots

### Main Dashboard

- Left sidebar: Incident list and unit management
- Center: Interactive map with incident/unit markers
- Bottom: Performance metrics

### Dispatch Modal

- Shows available units sorted by distance
- One-click dispatch to nearest unit

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

## 🚑 Response Units

The system comes pre-configured with 10 response units:

| Unit ID | Name | Type | Initial Status |
|---------|------|------|----------------|
| AMB01 | Ambulance Alpha | 🚑 Ambulance | Available |
| AMB02 | Ambulance Bravo | 🚑 Ambulance | Available |
| AMB03 | Ambulance Charlie | 🚑 Ambulance | Busy |
| FIRE01 | Fire Truck Delta | 🚒 Fire | Available |
| FIRE02 | Fire Truck Echo | 🚒 Fire | Available |
| FIRE03 | Fire Truck Foxtrot | 🚒 Fire | Busy |
| POL01 | Police Unit Golf | 🚔 Police | Available |
| POL02 | Police Unit Hotel | 🚔 Police | Available |
| POL03 | Police Unit India | 🚔 Police | Busy |
| POL04 | Police Unit Juliet | 🚔 Police | Available |

## 📝 Important Notes

- **Incidents are session-based**: All incidents are cleared when the backend server restarts
- **Units persist**: Response units are stored permanently in MongoDB
- **AI Classification**: Works with keyword-based fallback when OpenAI API key is not configured
- **Auto-refresh**: Dashboard automatically refreshes every 10 seconds

## 🧪 Testing the API

```bash
# Create a new incident (AI will classify severity)
curl -X POST http://localhost:5001/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Building fire",
    "description": "Flames visible from multiple floors, people trapped",
    "lat": 28.6139,
    "lng": 77.2090
  }'

# Get all incidents
curl http://localhost:5001/api/incidents

# Get all units
curl http://localhost:5001/api/units
```

---

**Built with ❤️ for emergency response teams**
