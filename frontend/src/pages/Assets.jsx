import {
  Cpu,
  Server,
} from "lucide-react";

import {
  useMemo,
} from "react";

import {
  useSoc,
} from "../context/SocContext";


function Assets() {
  const {
    alerts,
    latest,
    online,
  } = useSoc();


  const assets = useMemo(() => {

    const map = new Map();

    alerts.forEach((alert) => {

      if (!alert.node) return;

      const existing =
        map.get(alert.node);

      map.set(
        alert.node,
        {
          node: alert.node,

          detections:
            (existing?.detections || 0)
            + 1,

          lastAttack:
            alert.attack,

          severity:
            alert.severity,

          lastSeen:
            alert.timestamp,
        }
      );

    });


    if (
      latest?.node
      &&
      !map.has(latest.node)
    ) {
      map.set(
        latest.node,
        {
          node: latest.node,
          detections: 1,
          lastAttack:
            latest.attack,
          severity:
            latest.severity,
          lastSeen:
            latest.timestamp,
        }
      );
    }


    return [...map.values()];

  }, [alerts, latest]);


  return (
    <div className="page-shell">

      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            ASSET INVENTORY
          </span>

          <h1>Assets</h1>

          <p>
            Nodes observed by MITNICK ASSIST.
          </p>
        </div>

      </div>


      <div className="asset-grid">

        {assets.map(
          (asset) => (

            <div
              className="panel asset-card"
              key={asset.node}
            >

              <div className="asset-icon">
                <Cpu size={22} />
              </div>

              <h3>
                {asset.node}
              </h3>

              <Info
                name="Status"
                value={
                  online
                    ? "ONLINE"
                    : "UNKNOWN"
                }
              />

              <Info
                name="Detections"
                value={
                  asset.detections
                }
              />

              <Info
                name="Last Event"
                value={
                  asset.lastAttack
                }
              />

              <Info
                name="Severity"
                value={
                  asset.severity
                }
              />

            </div>

          )
        )}


        <div className="panel asset-card">

          <div className="asset-icon">
            <Server size={22} />
          </div>

          <h3>
            MITNICK API
          </h3>

          <Info
            name="Service"
            value="FastAPI"
          />

          <Info
            name="Status"
            value={
              online
                ? "ONLINE"
                : "OFFLINE"
            }
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
      <strong>
        {value ?? "-"}
      </strong>
    </div>
  );
}


export default Assets;
