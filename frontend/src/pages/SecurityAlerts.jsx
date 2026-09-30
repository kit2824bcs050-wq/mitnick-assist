import {
  useMemo,
  useState,
} from "react";

import {
  Search,
  TriangleAlert,
} from "lucide-react";

import {
  useSoc,
} from "../context/SocContext";


function SecurityAlerts() {
  const { alerts } = useSoc();

  const [query, setQuery] =
    useState("");

  const [severity, setSeverity] =
    useState("ALL");


  const filtered =
    useMemo(() => {

      return alerts.filter((alert) => {

        const searchMatch =
          `${alert.attack} ${alert.node}`
            .toLowerCase()
            .includes(
              query.toLowerCase()
            );

        const severityMatch =
          severity === "ALL"
          ||
          alert.severity === severity;

        return (
          searchMatch
          &&
          severityMatch
        );
      });

    }, [
      alerts,
      query,
      severity,
    ]);


  return (
    <div className="page-shell">

      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            INCIDENT MANAGEMENT
          </span>

          <h1>
            Security Alerts
          </h1>

          <p>
            Investigate detections produced by the DNN engine.
          </p>
        </div>

      </div>


      <div className="toolbar-v2">

        <div className="search-v2">

          <Search size={17} />

          <input
            placeholder="Search attack or node..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
          />

        </div>


        <select
          value={severity}
          onChange={(e) =>
            setSeverity(e.target.value)
          }
        >
          <option value="ALL">
            All severity
          </option>

          <option value="HIGH">
            High
          </option>

          <option value="MEDIUM">
            Medium
          </option>

          <option value="LOW">
            Low
          </option>

        </select>

      </div>


      <div className="panel">

        <div className="panel-title">

          <div>
            <p>INCIDENT QUEUE</p>

            <h3>
              {filtered.length} Alerts
            </h3>
          </div>

          <TriangleAlert size={20} />

        </div>


        <div className="table-wrap">

          <table className="soc-table">

            <thead>
              <tr>
                <th>Time</th>
                <th>Attack</th>
                <th>Node</th>
                <th>Confidence</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filtered.map(
                (alert, index) => (

                  <tr key={index}>

                    <td>
                      {alert.timestamp
                        ? new Date(
                            alert.timestamp
                          )
                            .toLocaleTimeString()
                        : "-"}
                    </td>

                    <td>
                      {alert.attack}
                    </td>

                    <td>
                      {alert.node}
                    </td>

                    <td>
                      {alert.confidence}%
                    </td>

                    <td>
                      <span
                        className={
                          `severity-pill ${
                            alert.severity
                              ?.toLowerCase()
                          }`
                        }
                      >
                        {alert.severity}
                      </span>
                    </td>

                    <td>
                      {alert.status}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


export default SecurityAlerts;
