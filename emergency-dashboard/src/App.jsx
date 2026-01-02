import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./App.css";

// API Base URL
const API_URL = "http://localhost:5001/api";

// Leaflet icons fix for Vite
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Custom icons for incidents and units
const createIcon = (color, size = 30) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const severityColors = {
  high: "#e94560",
  medium: "#f39c12",
  low: "#27ae60",
};

const unitColors = {
  ambulance: "#e94560",
  fire: "#f39c12",
  police: "#3498db",
};

const unitEmojis = {
  ambulance: "🚑",
  fire: "🚒",
  police: "🚔",
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Map component that handles centering
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function EmergencyDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("incidents");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [metrics, setMetrics] = useState({
    totalIncidents: 0,
    activeIncidents: 0,
    avgResponseTime: 0,
    unitsDeployed: 0,
  });
  const [showNewIncidentForm, setShowNewIncidentForm] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    lat: "",
    lng: "",
  });
  const [classifying, setClassifying] = useState(false);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      const [incidentsRes, unitsRes] = await Promise.all([
        fetch(`${API_URL}/incidents`),
        fetch(`${API_URL}/units`),
      ]);

      if (!incidentsRes.ok || !unitsRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const incidentsData = await incidentsRes.json();
      const unitsData = await unitsRes.json();

      setIncidents(incidentsData);
      setUnits(unitsData);

      // Update metrics
      const activeCount = incidentsData.filter(
        (i) => !assignments[i.id]
      ).length;
      const deployedCount = Object.keys(assignments).length;

      setMetrics({
        totalIncidents: incidentsData.length,
        activeIncidents: activeCount,
        avgResponseTime: deployedCount > 0 ? 4.5 : 0,
        unitsDeployed: deployedCount,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [assignments]);

  useEffect(() => {
    fetchData();
    // Poll for updates every 10 seconds for real-time updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  // Handle incident click - center map on incident
  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
    setMapCenter([incident.lat, incident.lng]);
  };

  // Open assignment modal
  const handleAssignClick = (incident) => {
    console.log("Opening dispatch modal for incident:", incident);
    setSelectedIncident(incident);
    setSelectedUnit(null); // Reset selected unit
    setShowAssignModal(true);
  };

  // Assign unit to incident
  const handleAssignUnit = () => {
    console.log("handleAssignUnit called");
    console.log("selectedUnit:", selectedUnit);
    console.log("selectedIncident:", selectedIncident);

    if (!selectedUnit) {
      console.log("No unit selected!");
      return;
    }

    if (!selectedIncident) {
      console.log("No incident selected!");
      return;
    }

    console.log(
      "Assigning unit",
      selectedUnit.name,
      "to incident",
      selectedIncident.title
    );

    const newAssignments = {
      ...assignments,
      [selectedIncident.id]: {
        unit: selectedUnit,
        assignedAt: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 10) + 2,
      },
    };
    setAssignments(newAssignments);

    // Update unit status
    setUnits(
      units.map((u) =>
        u.id === selectedUnit.id ? { ...u, status: "dispatched" } : u
      )
    );

    // Update metrics
    setMetrics((prev) => ({
      ...prev,
      activeIncidents: prev.activeIncidents - 1,
      unitsDeployed: prev.unitsDeployed + 1,
      avgResponseTime:
        (prev.avgResponseTime * prev.unitsDeployed +
          newAssignments[selectedIncident.id].responseTime) /
        (prev.unitsDeployed + 1),
    }));

    console.log("Assignment complete, closing modal");
    setShowAssignModal(false);
    setSelectedUnit(null);
  };

  // Get available units sorted by distance
  const getAvailableUnits = (incident) => {
    return units
      .filter((u) => u.status === "available")
      .map((u) => ({
        ...u,
        distance: calculateDistance(incident.lat, incident.lng, u.lat, u.lng),
      }))
      .sort((a, b) => a.distance - b.distance);
  };

  // Create new incident - sends to backend for AI classification
  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setClassifying(true);

    try {
      // Send incident to backend - AI will classify severity automatically
      const response = await fetch(`${API_URL}/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newIncident.title,
          description: newIncident.description,
          lat: parseFloat(newIncident.lat),
          lng: parseFloat(newIncident.lng),
          // Don't send severity - let backend AI classify it
        }),
      });

      if (response.ok) {
        const created = await response.json();
        console.log(
          "Incident created with AI-classified severity:",
          created.severity
        );
        setIncidents([...incidents, created]);
        setNewIncident({ title: "", description: "", lat: "", lng: "" });
        setShowNewIncidentForm(false);
        setMetrics((prev) => ({
          ...prev,
          totalIncidents: prev.totalIncidents + 1,
          activeIncidents: prev.activeIncidents + 1,
        }));
      }
    } catch (err) {
      console.error("Error creating incident:", err);
    } finally {
      setClassifying(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading Emergency Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={fetchData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="panel-header">
          <h2>🚨 Emergency Dispatch</h2>
        </div>

        {/* Tab Buttons */}
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === "incidents" ? "active" : ""}`}
            onClick={() => setActiveTab("incidents")}
          >
            Incidents ({incidents.length})
          </button>
          <button
            className={`tab-btn ${activeTab === "units" ? "active" : ""}`}
            onClick={() => setActiveTab("units")}
          >
            Units ({units.length})
          </button>
        </div>

        {/* Panel Content */}
        <div className="panel-content">
          {activeTab === "incidents" ? (
            <>
              {/* New Incident Button */}
              <button
                className="assign-btn"
                style={{ marginBottom: "15px" }}
                onClick={() => setShowNewIncidentForm(!showNewIncidentForm)}
              >
                {showNewIncidentForm ? "Cancel" : "+ Report New Incident"}
              </button>

              {/* New Incident Form */}
              {showNewIncidentForm && (
                <form
                  className="new-incident-form"
                  onSubmit={handleCreateIncident}
                >
                  <h3>📝 New Incident Report</h3>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={newIncident.title}
                      onChange={(e) =>
                        setNewIncident({
                          ...newIncident,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g., Building Fire"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (for AI classification)</label>
                    <textarea
                      value={newIncident.description}
                      onChange={(e) =>
                        setNewIncident({
                          ...newIncident,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe the incident in detail..."
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newIncident.lat}
                      onChange={(e) =>
                        setNewIncident({ ...newIncident, lat: e.target.value })
                      }
                      placeholder="e.g., 28.6139"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={newIncident.lng}
                      onChange={(e) =>
                        setNewIncident({ ...newIncident, lng: e.target.value })
                      }
                      placeholder="e.g., 77.209"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={classifying}
                  >
                    {classifying ? "🤖 AI Classifying..." : "Submit & Classify"}
                  </button>
                </form>
              )}

              {/* Incident List */}
              {incidents.map((incident) => {
                const assignment = assignments[incident.id];
                return (
                  <div
                    key={incident.id}
                    className={`incident-card severity-${incident.severity} ${
                      assignment ? "assigned" : ""
                    }`}
                    onClick={() => handleIncidentClick(incident)}
                  >
                    <div className="incident-header">
                      <span className="incident-id">#{incident.id}</span>
                      <span className={`severity-badge ${incident.severity}`}>
                        {incident.severity}
                      </span>
                    </div>
                    <div className="incident-title">{incident.title}</div>
                    {incident.description && (
                      <div className="incident-description">
                        {incident.description}
                      </div>
                    )}
                    <div className="incident-meta">
                      <span>
                        📍 {incident.lat.toFixed(4)}, {incident.lng.toFixed(4)}
                      </span>
                    </div>

                    {assignment ? (
                      <div className="assigned-info">
                        ✅ Assigned to{" "}
                        <span className="unit-name">
                          {assignment.unit.name}
                        </span>
                        <br />
                        <span className="response-time">
                          ⏱️ ETA: {assignment.responseTime} min
                        </span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="assign-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log(
                            "Dispatch button clicked for:",
                            incident.title
                          );
                          handleAssignClick(incident);
                        }}
                      >
                        🚀 Dispatch Unit
                      </button>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            /* Units List */
            units.map((unit) => (
              <div key={unit.id} className="unit-card">
                <div className={`unit-icon ${unit.type}`}>
                  {unitEmojis[unit.type] || "🚗"}
                </div>
                <div className="unit-info">
                  <div className="unit-name">{unit.name || unit.id}</div>
                  <div className="unit-type">{unit.type}</div>
                </div>
                <span className={`unit-status ${unit.status}`}>
                  {unit.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        {/* Header with Stats */}
        <div className="header">
          <h1>🗺️ Emergency Response Map</h1>
          <div className="header-stats">
            <button
              onClick={handleRefresh}
              style={{
                padding: "8px 16px",
                background: "#0f3460",
                border: "1px solid #e94560",
                borderRadius: "8px",
                color: "#fff",
                cursor: "pointer",
                marginRight: "15px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              🔄 Refresh
            </button>
            <div className="stat-item">
              <div className="value">{metrics.totalIncidents}</div>
              <div className="label">Total</div>
            </div>
            <div className="stat-item">
              <div className="value">{metrics.activeIncidents}</div>
              <div className="label">Active</div>
            </div>
            <div className="stat-item">
              <div className="value">{metrics.unitsDeployed}</div>
              <div className="label">Deployed</div>
            </div>
            <div className="stat-item">
              <div className="value">{metrics.avgResponseTime.toFixed(1)}m</div>
              <div className="label">Avg Response</div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="map-container">
          <MapContainer
            center={[28.6139, 77.209]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MapController center={mapCenter} />

            {/* Incident Markers */}
            {incidents.map((incident) => (
              <Marker
                key={`incident-${incident.id}`}
                position={[incident.lat, incident.lng]}
                icon={createIcon(severityColors[incident.severity], 28)}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>{incident.title}</h4>
                    <p>
                      <strong>Severity:</strong> {incident.severity}
                    </p>
                    {incident.description && <p>{incident.description}</p>}
                    {assignments[incident.id] && (
                      <p>
                        <strong>Assigned:</strong>{" "}
                        {assignments[incident.id].unit.name}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Unit Markers */}
            {units.map((unit) => (
              <Marker
                key={`unit-${unit.id}`}
                position={[unit.lat, unit.lng]}
                icon={createIcon(unitColors[unit.type] || "#3498db", 24)}
              >
                <Popup>
                  <div className="popup-content">
                    <h4>
                      {unitEmojis[unit.type]} {unit.name || unit.id}
                    </h4>
                    <p>
                      <strong>Type:</strong> {unit.type}
                    </p>
                    <p>
                      <strong>Status:</strong> {unit.status}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Map Legend */}
          <div className="map-legend">
            <h4>Legend</h4>
            <div className="legend-item">
              <div className="legend-dot high"></div>
              <span>High Severity</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot medium"></div>
              <span>Medium Severity</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot low"></div>
              <span>Low Severity</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot unit"></div>
              <span>Response Unit</span>
            </div>
          </div>
        </div>

        {/* Metrics Panel */}
        <div className="metrics-panel">
          <div className="metric-card">
            <div className="metric-value" style={{ color: "#e94560" }}>
              {incidents.filter((i) => i.severity === "high").length}
            </div>
            <div className="metric-label">High Priority</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: "#f39c12" }}>
              {incidents.filter((i) => i.severity === "medium").length}
            </div>
            <div className="metric-label">Medium Priority</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: "#27ae60" }}>
              {incidents.filter((i) => i.severity === "low").length}
            </div>
            <div className="metric-label">Low Priority</div>
          </div>
          <div className="metric-card">
            <div className="metric-value" style={{ color: "#3498db" }}>
              {units.filter((u) => u.status === "available").length}
            </div>
            <div className="metric-label">Available Units</div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedIncident && (
        <div
          className="modal-overlay"
          onClick={() => {
            console.log("Modal overlay clicked - closing");
            setShowAssignModal(false);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>🚀 Dispatch Unit</h3>
            <p style={{ marginBottom: "15px", color: "#aaa" }}>
              Select a unit to dispatch to:{" "}
              <strong>{selectedIncident.title}</strong>
            </p>

            <div className="modal-unit-list">
              {getAvailableUnits(selectedIncident).length === 0 ? (
                <p style={{ color: "#888", textAlign: "center" }}>
                  No available units
                </p>
              ) : (
                getAvailableUnits(selectedIncident).map((unit) => (
                  <div
                    key={unit.id}
                    className={`modal-unit-item ${
                      selectedUnit?.id === unit.id ? "selected" : ""
                    }`}
                    onClick={() => {
                      console.log("Unit selected:", unit.name);
                      setSelectedUnit(unit);
                    }}
                  >
                    <div>
                      <strong>
                        {unitEmojis[unit.type]} {unit.name || unit.id}
                      </strong>
                      <div style={{ fontSize: "0.8rem", color: "#888" }}>
                        {unit.type}
                      </div>
                    </div>
                    <div className="modal-unit-distance">
                      📍 {unit.distance.toFixed(2)} km
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn secondary"
                onClick={() => {
                  console.log("Cancel clicked");
                  setShowAssignModal(false);
                  setSelectedUnit(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn primary"
                style={{
                  opacity: selectedUnit ? 1 : 0.5,
                  cursor: selectedUnit ? "pointer" : "not-allowed",
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Dispatch button clicked!");
                  console.log("Current selectedUnit:", selectedUnit);
                  if (selectedUnit) {
                    handleAssignUnit();
                  } else {
                    alert("Please select a unit first!");
                  }
                }}
              >
                {selectedUnit
                  ? `Dispatch ${selectedUnit.name}`
                  : "Select a Unit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
