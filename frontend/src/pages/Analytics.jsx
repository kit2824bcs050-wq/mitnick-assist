import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  useSoc,
} from "../context/SocContext";


function Analytics() {
  const {
    stats,
    alerts,
  } = useSoc();


  const severity = {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };


  alerts.forEach((alert) => {
    if (
      severity[
        alert.severity
      ] !== undefined
    ) {
      severity[
        alert.severity
      ]++;
    }
  });


  const data = [
    {
      name: "Normal",
      value:
        stats.normal || 0,
    },
    {
      name: "Brute Force",
      value:
        stats.brute_force || 0,
    },
    {
      name: "Port Scan",
      value:
        stats.port_scan || 0,
    },
  ];


  const COLORS = [
    "#22c55e",
    "#ef4444",
    "#eab308",
  ];


  return (
    <div className="page-shell">

      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            THREAT INTELLIGENCE
          </span>

          <h1>Analytics</h1>

          <p>
            Detection and severity analysis.
          </p>
        </div>

      </div>


      <div className="dashboard-grid">

        <div className="panel">

          <div className="panel-title">
            <div>
              <p>
                DISTRIBUTION
              </p>

              <h3>
                Detection Types
              </h3>
            </div>
          </div>


          <div className="chart-box">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                >

                  {data.map(
                    (_, index) => (

                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

        </div>


        <div className="panel">

          <div className="panel-title">

            <div>
              <p>SEVERITY</p>
              <h3>
                Incident Levels
              </h3>
            </div>

          </div>

          <Info
            name="High"
            value={severity.HIGH}
          />

          <Info
            name="Medium"
            value={severity.MEDIUM}
          />

          <Info
            name="Low"
            value={severity.LOW}
          />

          <Info
            name="Total Attacks"
            value={stats.attacks}
          />

        </div>

      </div>

    </div>
  );
}


function Info({
  name,
  value,
}) {
  return (
    <div className="info-row">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}


export default Analytics;
