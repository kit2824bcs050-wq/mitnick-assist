import { useEffect, useState } from "react";
import axios from "axios";

import {
  Shield,
  Activity,
  TriangleAlert,
  Radar,
  Bot,
  Server,
  LayoutDashboard,
  FileText,
  Settings,
  Cpu,
  Wifi,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import "./App.css";


const API = "http://127.0.0.1:8000";


function App() {

  // ============================
  // DASHBOARD STATE
  // ============================

  const [stats, setStats] = useState({
    total_events: 0,
    attacks: 0,
    normal: 0,
    brute_force: 0,
    port_scan: 0,
  });

  const [alerts, setAlerts] = useState([]);
  const [latest, setLatest] = useState(null);

  const [backendOnline, setBackendOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);


  // ============================
  // AI INVESTIGATION STATE
  // ============================

  const [investigation, setInvestigation] = useState(null);

  const [investigating, setInvestigating] = useState(false);

  const [investigationError, setInvestigationError] =
    useState("");


  // ============================
  // LOAD FASTAPI DATA
  // ============================

  const loadData = async () => {

    try {

      const [
        statsResponse,
        alertsResponse,
        latestResponse,
      ] = await Promise.all([

        axios.get(`${API}/stats`),

        axios.get(`${API}/alerts`),

        axios.get(`${API}/alerts/latest`),

      ]);


      // Stats
      setStats({
        total_events:
          statsResponse.data?.total_events ?? 0,

        attacks:
          statsResponse.data?.attacks ?? 0,

        normal:
          statsResponse.data?.normal ?? 0,

        brute_force:
          statsResponse.data?.brute_force ?? 0,

        port_scan:
          statsResponse.data?.port_scan ?? 0,
      });


      // Alerts
      if (Array.isArray(alertsResponse.data)) {
        setAlerts(alertsResponse.data);
      } else {
        setAlerts([]);
      }


      // Latest incident
      if (latestResponse.data?.attack) {
        setLatest(latestResponse.data);
      } else {
        setLatest(null);
      }


      setBackendOnline(true);

      setLastUpdate(new Date());

    } catch (error) {

      console.error(
        "MITNICK backend error:",
        error
      );

      setBackendOnline(false);
    }
  };


  // ============================
  // AUTO REFRESH
  // ============================

  useEffect(() => {

    loadData();

    const interval = setInterval(
      loadData,
      3000
    );

    return () =>
      clearInterval(interval);

  }, []);


  // ============================
  // SOC INVESTIGATION
  // ============================

  const investigateLatest = async () => {

    try {

      setInvestigating(true);

      setInvestigationError("");

      const response = await axios.get(
        `${API}/ai/investigate/latest`
      );


      if (response.data?.message) {

        setInvestigation(null);

        setInvestigationError(
          response.data.message
        );

        return;
      }


      setInvestigation(
        response.data
      );


    } catch (error) {

      console.error(
        "Investigation failed:",
        error
      );

      setInvestigation(null);

      setInvestigationError(
        "Unable to contact the investigation engine."
      );

    } finally {

      setInvestigating(false);
    }
  };


  // ============================
  // CHART DATA
  // ============================

  const chartData = [

    {
      name: "Normal",
      value: stats.normal,
    },

    {
      name: "Brute Force",
      value: stats.brute_force,
    },

    {
      name: "Port Scan",
      value: stats.port_scan,
    },

  ];


  return (

    <div className="app">

      {/* ============================
          SIDEBAR
      ============================ */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Shield size={25} />
          </div>

          <div>

            <h2>MITNICK</h2>

            <span>ASSIST</span>

          </div>

        </div>


        <nav>

          <div className="nav-item active">
            <LayoutDashboard size={19} />
            Overview
          </div>

          <div className="nav-item">
            <TriangleAlert size={19} />
            Security Alerts
          </div>

          <div className="nav-item">
            <Server size={19} />
            Assets
          </div>

          <div className="nav-item">
            <Bot size={19} />
            AI SOC
          </div>

          <div className="nav-item">
            <FileText size={19} />
            Reports
          </div>

          <div className="nav-item">
            <Settings size={19} />
            Settings
          </div>

        </nav>


        <div className="sidebar-footer">

          <div
            className={
              backendOnline
                ? "status-dot online"
                : "status-dot offline"
            }
          />

          {backendOnline
            ? "SYSTEM ONLINE"
            : "BACKEND OFFLINE"}

        </div>

      </aside>


      {/* ============================
          MAIN
      ============================ */}

      <main className="main">

        {/* TOP BAR */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              SECURITY OPERATIONS CENTER
            </p>

            <h1>
              Threat Overview
            </h1>

            <small
              style={{
                color: "#64748b",
              }}
            >
              Last refresh:{" "}

              {lastUpdate
                ? lastUpdate.toLocaleTimeString()
                : "Waiting..."}
            </small>

          </div>


          <div className="node-status">

            <Wifi size={18} />

            SANDBOX-01

            <span>
              ACTIVE
            </span>

          </div>

        </header>


        {/* ============================
            METRICS
        ============================ */}

        <section className="metric-grid">

          <Metric
            icon={<Activity />}
            title="Total Events"
            value={stats.total_events}
          />

          <Metric
            icon={<TriangleAlert />}
            title="Detected Attacks"
            value={stats.attacks}
            danger
          />

          <Metric
            icon={<Shield />}
            title="Normal Events"
            value={stats.normal}
          />

          <Metric
            icon={<Radar />}
            title="Brute Force"
            value={stats.brute_force}
          />

          <Metric
            icon={<Cpu />}
            title="Port Scans"
            value={stats.port_scan}
          />

        </section>


        {/* ============================
            ANALYTICS + LATEST INCIDENT
        ============================ */}

        <section className="middle-grid">

          {/* THREAT GRAPH */}

          <div className="panel">

            <div className="panel-title">

              <div>

                <p>
                  THREAT ANALYTICS
                </p>

                <h3>
                  Detection Distribution
                </h3>

              </div>

              <Radar size={21} />

            </div>


            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={chartData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                  />

                  <YAxis
                    stroke="#64748b"
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border:
                        "1px solid #273449",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                  />

                  <Bar
                    dataKey="value"
                    fill="#38bdf8"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* LATEST INCIDENT */}

          <div className="panel incident-panel">

            <div className="panel-title">

              <div>

                <p>
                  LATEST INCIDENT
                </p>

                <h3>
                  Threat Intelligence
                </h3>

              </div>

              <TriangleAlert
                size={21}
              />

            </div>


            {latest ? (

              <>

                <div className="incident-name">

                  {latest.attack}

                </div>


                <div className="incident-row">

                  <span>
                    Target
                  </span>

                  <strong>
                    {latest.node}
                  </strong>

                </div>


                <div className="incident-row">

                  <span>
                    Confidence
                  </span>

                  <strong>

                    {latest.confidence}%

                  </strong>

                </div>


                <div className="incident-row">

                  <span>
                    Severity
                  </span>

                  <strong
                    className={
                      `severity ${
                        latest.severity
                          ?.toLowerCase()
                      }`
                    }
                  >

                    {latest.severity}

                  </strong>

                </div>


                <div className="incident-row">

                  <span>
                    Status
                  </span>

                  <strong>
                    {latest.status}
                  </strong>

                </div>


                <button

                  className="investigate-button"

                  onClick={
                    investigateLatest
                  }

                  disabled={
                    investigating
                  }

                >

                  <Bot size={18} />

                  {investigating
                    ? "Investigating..."
                    : "Investigate with AI"}

                </button>

              </>

            ) : (

              <div className="no-alert">

                No active threats detected

              </div>

            )}

          </div>

        </section>


        {/* ============================
            AI INVESTIGATION
        ============================ */}

        {(investigation ||
          investigationError) && (

          <section className="panel ai-investigation">

            <div className="panel-title">

              <div>

                <p>
                  MITNICK AI SOC
                </p>

                <h3>
                  Incident Investigation
                </h3>

              </div>

              <Bot size={22} />

            </div>


            {investigationError ? (

              <div className="investigation-error">

                {investigationError}

              </div>

            ) : (

              <>

                {/* Investigation Header */}

                <div className="ai-header">

                  <div>

                    <span>
                      Incident
                    </span>

                    <strong>
                      {investigation.incident}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Confidence
                    </span>

                    <strong>

                      {investigation.confidence}%

                    </strong>

                  </div>


                  <div>

                    <span>
                      Severity
                    </span>

                    <strong
                      className={
                        `severity ${
                          investigation
                            .severity
                            ?.toLowerCase()
                        }`
                      }
                    >

                      {investigation.severity}

                    </strong>

                  </div>

                </div>

 
               <div className="ai-meta">

                 <div>
                   <span>AI Engine</span>
                   <strong>
                     {investigation.engine || "Unknown"}
                   </strong>
                  </div>

                   <div>
                     <span>Risk</span>
                     <strong>
                       {investigation.risk || investigation.severity}
                     </strong>
                   </div>

                   <div>
                     <span>Generation Time</span>
                     <strong>
                       {investigation.generation_time_seconds
                         ? `${investigation.generation_time_seconds}s`
                         : "-"}
                     </strong>
                   </div>

                </div>

           

                {/* Summary */}

                <div className="investigation-section">

                  <h4>
                    Summary
                  </h4>

                  <p>
                    {investigation.summary}
                  </p>

                </div>


                {/* Analysis */}

                <div className="investigation-section">

                  <h4>
                    Analysis
                  </h4>

                  <p>
                    {investigation.reasoning}
                  </p>

                </div>


                {/* Evidence + Actions */}

                <div className="investigation-grid">

                  <div className="investigation-section">

                    <h4>
                      Evidence
                    </h4>

                    <ul>

                      {investigation
                        .evidence
                        ?.map(
                          (
                            item,
                            index
                          ) => (

                            <li
                              key={index}
                            >

                              {item}

                            </li>

                          )
                        )}

                    </ul>

                  </div>


                  <div className="investigation-section">

                    <h4>
                      Recommended Actions
                    </h4>

                    <ol>

                      {investigation
                        .recommended_actions
                        ?.map(
                          (
                            item,
                            index
                          ) => (

                            <li
                              key={index}
                            >

                              {item}

                            </li>

                          )
                        )}

                    </ol>

                  </div>

                </div>


                {investigation
                  .analyst_decision_required && (

                  <div className="analyst-warning">

                    Human analyst approval
                    required before taking
                    containment or response
                    actions.

                  </div>

                )}

              </>

            )}

          </section>

        )} 

        {/* ============================
            SECURITY EVENT TABLE
        ============================ */}

        <section className="panel events-panel">

          <div className="panel-title">

            <div>

              <p>
                LIVE MONITORING
              </p>

              <h3>
                Security Events
              </h3>

            </div>

            <Activity size={21} />

          </div>


          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>
                    Time
                  </th>

                  <th>
                    Node
                  </th>

                  <th>
                    Attack
                  </th>

                  <th>
                    Confidence
                  </th>

                  <th>
                    Severity
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {alerts.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="empty"
                    >

                      No security alerts

                    </td>

                  </tr>

                ) : (

                  alerts.map(
                    (
                      alert,
                      index
                    ) => (

                      <tr
                        key={`${alert.timestamp}-${index}`}
                      >

                        <td>

                          {alert.timestamp
                            ? new Date(
                                alert.timestamp
                              )
                                .toLocaleTimeString()
                            : "-"}

                        </td>


                        <td>
                          {alert.node}
                        </td>


                        <td className="attack-name">

                          {alert.attack}

                        </td>


                        <td>

                          {alert.confidence}%

                        </td>


                        <td>

                          <span
                            className={
                              `severity ${
                                alert.severity
                                  ?.toLowerCase()
                              }`
                            }
                          >

                            {alert.severity}

                          </span>

                        </td>


                        <td>

                          <span className="open-status">

                            {alert.status}

                          </span>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* ============================
            SYSTEM STATUS
        ============================ */}

        <section className="system-grid">

          <SystemStatus
            name="Sandbox Node"
            detail="ESP8266"
          />

          <SystemStatus
            name="Detection Engine"
            detail="DNN Active"
          />

          <SystemStatus
            name="API Gateway"
            detail={
              backendOnline
                ? "FastAPI Online"
                : "FastAPI Offline"
            }
            pending={
              !backendOnline
            }
          />

          <SystemStatus
            name="AI Investigator"
            detail="SOC Investigation Active"
          />

        </section>

      </main>

    </div>

  );
}



// ============================
// METRIC COMPONENT
// ============================

function Metric({
  icon,
  title,
  value,
  danger = false,
}) {

  return (

    <div
      className={
        `metric ${
          danger
            ? "danger"
            : ""
        }`
      }
    >

      <div className="metric-icon">
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  );
}



// ============================
// SYSTEM STATUS COMPONENT
// ============================

function SystemStatus({
  name,
  detail,
  pending = false,
}) {

  return (

    <div className="system-card">

      <div
        className={
          pending
            ? "system-light pending"
            : "system-light"
        }
      />


      <div>

        <strong>
          {name}
        </strong>

        <span>
          {detail}
        </span>

      </div>

    </div>

  );
}


export default App;
