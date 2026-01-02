import { incidents } from "../data/incidents";

export default function AssignmentPanel() {
    return (
        <div
            style={{
                width: "320px",
                background: "#111",
                color: "#fff",
                padding: "15px",
                overflowY: "auto"
            }}
        >
            <h2>🚨 Dispatch Panel</h2>

            {incidents.map((incident) => (
                <div
                    key={incident.id}
                    style={{
                        marginBottom: "15px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid #333"
                    }}
                >
                    <strong>{incident.id}</strong>
                    <p>{incident.description}</p>
                    <p>
                        Severity: <b>{incident.severity}</b>
                    </p>

                    <button
                        style={{
                            padding: "6px 12px",
                            background: "#0d6efd",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer"
                        }}
                    >
                        Assign Nearest Unit
                    </button>
                </div>
            ))}
        </div>
    );
}
