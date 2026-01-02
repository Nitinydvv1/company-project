import L from "leaflet";

export const incidentIcon = (severity) =>
    new L.Icon({
        iconUrl:
            severity === "high"
                ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                : severity === "medium"
                    ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                    : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        iconSize: [32, 32],
    });

export const unitIcon = (status) =>
    new L.Icon({
        iconUrl:
            status === "available"
                ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                : "https://maps.google.com/mapfiles/ms/icons/grey-dot.png",
        iconSize: [32, 32],
    });
