import {
  Activity,
  Bot,
  Radar,
  Server,
  Shield,
  TriangleAlert,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  useSoc,
} from "../context/SocContext";


function Overview() {
  const {
    stats,
    latest,
    online,
    lastUpdated,
  } = useSoc();


  const chartData = [
    {
      name: "Normal",
      value: stats.normal || 0,
    },
    {
      name: "Brute Force",
      value: stats.brute_force || 0,
    },
    {
      name: "Port Scan",
      value: stats.port_scan || 0,
    },
  ];


  const risk =
    stats.total_events > 0
      ? Math.round(
          (
            stats.attacks /
            stats.total_events
          ) * 100
        )
      : 0;


  return (
    <div className="page-shell">

      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            SECURITY OPERATIONS CENTER
          </span>

          <h1>
            Threat Overview
          </h1>

          <p>
            Live MITNICK ASSIST security telemetry.
          </p>
        </div>


        <div
          className={
            online
              ? "live-badge"
              : "live-badge offline"
          }
        >
          <span />

          {online
            ? "SYSTEM ONLINE"
            : "BACKEND OFFLINE"}
        </div>

      </div>


      <div className="metric-grid-v2">

        <Metric
          title="Total Events"
          value={stats.total_events}
          icon={<Activity />}
        />

        <Metric
          title="Threats"
          value={stats.attacks}
          icon={<TriangleAlert />}
        />

        <Metric
          title="Normal"
          value={stats.normal}
          icon={<Shield />}
        />

        <Metric
          title="Risk Score"
          value={`${risk}%`}
          icon={<Radar />}
        />

      </div>


      <div className="dashboard-grid">

        <div className="panel">

          <div className="panel-title">
            <div>
              <p>
                DETECTION ANALYTICS
              </p>

              <h3>
                Event Distribution
              </h3>
            </div>

            <Activity size={20} />
          </div>


          <div className="chart-box">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart data={chartData}>

                <CartesianGrid
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                />

                <YAxis
                  stroke="#64748b"
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  fill="#38bdf8"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        <div className="panel">

          <div className="panel-title">
            <div>
              <p>
                LATEST DETECTION
              </p>

              <h3>
                Incident
              </h3>
            </div>

            <TriangleAlert size={20} />
          </div>


          {latest?.attack ? (
            <div className="incident-v2">

              <strong className="incident-type">
                {latest.attack}
              </strong>

              <Info
                name="Node"
                value={latest.node}
              />

              <Info
                name="Confidence"
                value={`${latest.confidence}%`}
              />

              <Info
                name="Severity"
                value={latest.severity}
              />

              <Info
                name="Status"
                value={latest.status}
              />

            </div>
          ) : (
            <p className="muted">
              No current incident.
            </p>
          )}

        </div>

      </div>


      <div className="service-grid">

        <Service
          icon={<Server />}
          name="FastAPI"
          status={
            online
              ? "ONLINE"
              : "OFFLINE"
          }
        />

        <Service
          icon={<Radar />}
          name="DNN Engine"
          status="ACTIVE"
        />

        <Service
          icon={<Bot />}
          name="Ollama SOC"
          status="READY"
        />

        <Service
          icon={<Shield />}
          name="SANDBOX-01"
          status="MONITORING"
        />

      </div>


      <p className="last-update">
        Last update:{" "}
        {lastUpdated
          ? lastUpdated.toLocaleTimeString()
          : "waiting"}
      </p>

    </div>
  );
}


function Metric({
  title,
  value,
  icon,
}) {
  return (
    <div className="metric-v2">

      <div className="metric-v2-icon">
        {icon}
      </div>

      <span>{title}</span>

      <strong>
        {value ?? 0}
      </strong>

    </div>
  );
}


function Info({ name, value }) {
  return (
    <div className="info-row">
      <span>{name}</span>
      <strong>{value ?? "-"}</strong>
    </div>
  );
}


function Service({
  icon,
  name,
  status,
}) {
  return (
    <div className="service-card">

      {icon}

      <div>
        <strong>{name}</strong>
        <span>{status}</span>
      </div>

    </div>
  );
}


export default Overview;
