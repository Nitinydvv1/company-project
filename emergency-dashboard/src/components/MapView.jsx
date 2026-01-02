import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5001/api/incidents")
      .then((res) => res.json())
      .then((data) => setIncidents(data))
      .catch((err) => console.error("API Error:", err));
  }, []);

  return (
    <MapContainer
      center={[28.6139, 77.209]}
      zoom={10}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {incidents.map((item) => (
        <Marker key={item.id} position={[item.lat, item.lng]}>
          <Popup>
            <strong>{item.title}</strong>
            <br />
            Severity: {item.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
